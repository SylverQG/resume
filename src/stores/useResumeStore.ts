import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'

import { sampleZh } from '@/markdown/samples/sample.zh'
import { getTemplate, templates } from '@/templates/registry'
import type { StyleOptions, ThemePreset } from '@/types/resume'

const STORAGE_KEY = 'resume-app:v1'

interface PersistedState {
  version: 1
  markdown: string
  templateId: string
  optionsByTemplate: Record<string, StyleOptions>
  customCss: string
  presets: ThemePreset[]
  targetPages: 1 | 2
  locale: 'zh-CN' | 'en'
}

function loadPersisted(): Partial<PersistedState> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PersistedState
    if (parsed.version !== 1) return null
    return parsed
  } catch {
    return null
  }
}

export const useResumeStore = defineStore('resume', () => {
  const saved = loadPersisted()

  /** Markdown 源文本 —— 唯一事实源 */
  const markdown = ref(saved?.markdown ?? sampleZh)

  const templateId = ref(saved?.templateId ?? 'classic')

  /** 每模板记住自己的样式覆盖（§3.4）；生效样式 = 模板默认 + 覆盖 */
  const optionsByTemplate = ref<Record<string, StyleOptions>>(saved?.optionsByTemplate ?? {})

  /** L3 自定义 CSS（M4 开放 UI），字段与持久化先行 */
  const customCss = ref(saved?.customCss ?? '')

  /** 样式方案列表（§3.7） */
  const presets = ref<ThemePreset[]>(saved?.presets ?? [])

  /** 目标页数（长度提示基准，M3 开放 UI） */
  const targetPages = ref<1 | 2>(saved?.targetPages ?? 1)

  /** 界面语言（M3 开放 UI） */
  const locale = ref<'zh-CN' | 'en'>(saved?.locale ?? 'zh-CN')

  const styleOptions = computed<StyleOptions>(() => ({
    ...getTemplate(templateId.value).defaults,
    ...optionsByTemplate.value[templateId.value],
  }))

  function setMarkdown(md: string) {
    markdown.value = md
  }

  function setTemplate(id: string) {
    if (!templates.some((t) => t.id === id)) return
    templateId.value = id
  }

  function setOption<K extends keyof StyleOptions>(key: K, value: StyleOptions[K]) {
    optionsByTemplate.value = {
      ...optionsByTemplate.value,
      [templateId.value]: { ...styleOptions.value, [key]: value },
    }
  }

  /** 恢复当前模板默认样式（清除用户覆盖） */
  function resetStyle() {
    const { [templateId.value]: _removed, ...rest } = optionsByTemplate.value
    optionsByTemplate.value = rest
  }

  function savePreset(name: string): ThemePreset | null {
    const trimmed = name.trim()
    if (!trimmed) return null
    const preset: ThemePreset = {
      id: crypto.randomUUID(),
      name: trimmed,
      templateId: templateId.value,
      options: { ...styleOptions.value },
      customCss: customCss.value || undefined,
    }
    presets.value = [...presets.value, preset]
    return preset
  }

  function applyPreset(id: string) {
    const preset = presets.value.find((p) => p.id === id)
    if (!preset) return
    templateId.value = preset.templateId
    optionsByTemplate.value = {
      ...optionsByTemplate.value,
      [preset.templateId]: { ...preset.options },
    }
    customCss.value = preset.customCss ?? ''
  }

  function deletePreset(id: string) {
    presets.value = presets.value.filter((p) => p.id !== id)
  }

  /** 导入样式方案（逐条校验，重建 id 避免冲突），返回成功导入条数 */
  function importPresets(list: unknown): number {
    if (!Array.isArray(list)) return 0
    const valid: ThemePreset[] = []
    for (const raw of list) {
      if (typeof raw !== 'object' || raw === null) continue
      const r = raw as Record<string, unknown>
      const templateIdImported =
        typeof r.templateId === 'string' && templates.some((t) => t.id === r.templateId)
          ? r.templateId
          : 'classic'
      const defaults = getTemplate(templateIdImported).defaults
      const options: StyleOptions =
        typeof r.options === 'object' && r.options !== null
          ? { ...defaults, ...(r.options as StyleOptions) }
          : defaults
      valid.push({
        id: crypto.randomUUID(),
        name: typeof r.name === 'string' && r.name.trim() ? r.name.trim() : 'Imported',
        templateId: templateIdImported,
        options,
        customCss: typeof r.customCss === 'string' ? r.customCss : undefined,
      })
    }
    presets.value = [...presets.value, ...valid]
    return valid.length
  }

  /** 「压缩到目标页数」前的样式快照（撤销压缩用；仅内存，不入持久化） */
  const compressSnapshot = ref<StyleOptions | null>(null)

  function beginCompressSnapshot() {
    compressSnapshot.value = { ...styleOptions.value }
  }

  function restoreCompress() {
    const snap = compressSnapshot.value
    if (!snap) return
    optionsByTemplate.value = {
      ...optionsByTemplate.value,
      [templateId.value]: { ...snap },
    }
    compressSnapshot.value = null
  }

  // localStorage 防抖 500ms 自动保存（§3.4）；版本号便于后续迁移
  let timer: ReturnType<typeof setTimeout> | undefined
  watch(
    [markdown, templateId, optionsByTemplate, customCss, presets, targetPages, locale],
    () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        try {
          const state: PersistedState = {
            version: 1,
            markdown: markdown.value,
            templateId: templateId.value,
            optionsByTemplate: optionsByTemplate.value,
            customCss: customCss.value,
            presets: presets.value,
            targetPages: targetPages.value,
            locale: locale.value,
          }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
        } catch {
          // 存储不可用（隐私模式/配额满）：自动保存失败可接受
        }
      }, 500)
    },
    { deep: true },
  )

  return {
    markdown,
    templateId,
    optionsByTemplate,
    customCss,
    presets,
    targetPages,
    locale,
    styleOptions,
    setMarkdown,
    setTemplate,
    setOption,
    resetStyle,
    savePreset,
    applyPreset,
    deletePreset,
    importPresets,
    compressSnapshot,
    beginCompressSnapshot,
    restoreCompress,
  }
})
