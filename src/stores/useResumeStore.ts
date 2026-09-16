import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'

import { sampleZh } from '@/markdown/samples/sample.zh'
import { getTemplate, templates } from '@/templates/registry'
import type { ResumeDoc, StyleOptions, ThemePreset } from '@/types/resume'

const STORAGE_KEY = 'resume-app:v1'

interface PersistedStateV2 {
  version: 2
  resumes: ResumeDoc[]
  activeResumeId: string
  presets: ThemePreset[]
  targetPages: 1 | 2
  locale: 'zh-CN' | 'en'
}

/** v1：单份简历（仅用于迁移） */
interface PersistedStateV1 {
  version: 1
  markdown: string
  templateId: string
  optionsByTemplate: Record<string, StyleOptions>
  customCss: string
  presets: ThemePreset[]
  targetPages: 1 | 2
  locale: 'zh-CN' | 'en'
}

function normalizeDoc(raw: unknown, fallbackName: string): ResumeDoc | null {
  if (typeof raw !== 'object' || raw === null) return null
  const r = raw as Record<string, unknown>
  if (typeof r.id !== 'string' || !r.id) return null
  const templateId =
    typeof r.templateId === 'string' && templates.some((t) => t.id === r.templateId)
      ? r.templateId
      : 'classic'
  return {
    id: r.id,
    name: typeof r.name === 'string' && r.name.trim() ? r.name : fallbackName,
    createdAt: typeof r.createdAt === 'number' ? r.createdAt : Date.now(),
    updatedAt: typeof r.updatedAt === 'number' ? r.updatedAt : Date.now(),
    markdown: typeof r.markdown === 'string' ? r.markdown : '',
    templateId,
    optionsByTemplate:
      typeof r.optionsByTemplate === 'object' && r.optionsByTemplate !== null
        ? (r.optionsByTemplate as Record<string, StyleOptions>)
        : {},
    customCss: typeof r.customCss === 'string' ? r.customCss : '',
    photo: typeof r.photo === 'string' ? r.photo : undefined,
    photoScale: typeof r.photoScale === 'number' ? r.photoScale : undefined,
  }
}

/** 读取持久化状态：v2 直读，v1 迁移为单份简历，损坏数据走全新默认 */
function loadState(): PersistedStateV2 {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, unknown>
      const locale = parsed.locale === 'en' ? 'en' : 'zh-CN'

      if (parsed.version === 2 && Array.isArray(parsed.resumes)) {
        const resumes = (parsed.resumes as unknown[])
          .map((r) => normalizeDoc(r, '简历'))
          .filter((r): r is ResumeDoc => r !== null)
        if (resumes.length > 0) {
          const activeResumeId =
            typeof parsed.activeResumeId === 'string' &&
            resumes.some((r) => r.id === parsed.activeResumeId)
              ? parsed.activeResumeId
              : resumes[0].id
          return {
            version: 2,
            resumes,
            activeResumeId,
            presets: Array.isArray(parsed.presets) ? (parsed.presets as ThemePreset[]) : [],
            targetPages: parsed.targetPages === 2 ? 2 : 1,
            locale,
          }
        }
      }

      if (parsed.version === 1) {
        const v1 = parsed as unknown as PersistedStateV1
        const doc = normalizeDoc(
          {
            id: crypto.randomUUID(),
            name: locale === 'en' ? 'My Resume' : '我的简历',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            markdown: v1.markdown,
            templateId: v1.templateId,
            optionsByTemplate: v1.optionsByTemplate,
            customCss: v1.customCss,
          },
          '简历',
        )
        if (doc) {
          return {
            version: 2,
            resumes: [doc],
            activeResumeId: doc.id,
            presets: Array.isArray(v1.presets) ? v1.presets : [],
            targetPages: v1.targetPages === 2 ? 2 : 1,
            locale,
          }
        }
      }
    }
  } catch {
    // 存储损坏：走全新默认状态
  }

  const doc: ResumeDoc = {
    id: crypto.randomUUID(),
    name: '简历 1',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    markdown: sampleZh,
    templateId: 'classic',
    optionsByTemplate: {},
    customCss: '',
  }
  return { version: 2, resumes: [doc], activeResumeId: doc.id, presets: [], targetPages: 1, locale: 'zh-CN' }
}

export const useResumeStore = defineStore('resume', () => {
  const initial = loadState()

  /** 全部简历（多简历管理） */
  const resumes = ref<ResumeDoc[]>(initial.resumes)
  const activeResumeId = ref(initial.activeResumeId)
  const presets = ref<ThemePreset[]>(initial.presets)
  const targetPages = ref<1 | 2>(initial.targetPages)
  const locale = ref<'zh-CN' | 'en'>(initial.locale)

  const activeDoc = computed(
    () => resumes.value.find((r) => r.id === activeResumeId.value) ?? resumes.value[0],
  )

  function touch() {
    const doc = activeDoc.value
    if (doc) doc.updatedAt = Date.now()
  }

  // ---- 以下文档级状态均为 activeDoc 字段的代理，对外 API 与单简历时代一致 ----

  /** Markdown 源文本 —— 当前简历的唯一事实源 */
  const markdown = computed({
    get: () => activeDoc.value?.markdown ?? '',
    set: (value: string) => {
      const doc = activeDoc.value
      if (doc) {
        doc.markdown = value
        doc.updatedAt = Date.now()
      }
    },
  })

  const templateId = computed({
    get: () => activeDoc.value?.templateId ?? 'classic',
    set: (id: string) => {
      const doc = activeDoc.value
      if (doc && templates.some((t) => t.id === id)) {
        doc.templateId = id
        doc.updatedAt = Date.now()
      }
    },
  })

  const optionsByTemplate = computed(() => activeDoc.value?.optionsByTemplate ?? {})

  const customCss = computed({
    get: () => activeDoc.value?.customCss ?? '',
    set: (value: string) => {
      const doc = activeDoc.value
      if (doc) {
        doc.customCss = value
        doc.updatedAt = Date.now()
      }
    },
  })

  /** 当前简历生效的样式 = 模板默认 + 用户覆盖（每模板记忆，§3.4） */
  const styleOptions = computed<StyleOptions>(() => ({
    ...getTemplate(templateId.value).defaults,
    ...optionsByTemplate.value[templateId.value],
  }))

  function setMarkdown(md: string) {
    markdown.value = md
  }

  function setTemplate(id: string) {
    templateId.value = id
  }

  function setOption<K extends keyof StyleOptions>(key: K, value: StyleOptions[K]) {
    const doc = activeDoc.value
    if (!doc) return
    doc.optionsByTemplate = {
      ...doc.optionsByTemplate,
      [doc.templateId]: { ...styleOptions.value, [key]: value },
    }
    doc.updatedAt = Date.now()
  }

  /** 恢复当前简历在当前模板的默认样式（清除用户覆盖） */
  function resetStyle() {
    const doc = activeDoc.value
    if (!doc) return
    const { [doc.templateId]: _removed, ...rest } = doc.optionsByTemplate
    doc.optionsByTemplate = rest
    doc.updatedAt = Date.now()
  }

  // ---- 多简历管理 ----

  function createResume(name: string): string {
    const doc: ResumeDoc = {
      id: crypto.randomUUID(),
      name: name.trim() || `简历 ${resumes.value.length + 1}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      markdown: '',
      templateId: 'classic',
      optionsByTemplate: {},
      customCss: '',
    }
    resumes.value = [...resumes.value, doc]
    activeResumeId.value = doc.id
    return doc.id
  }

  function duplicateResume(id: string, newName: string): string | null {
    const source = resumes.value.find((r) => r.id === id)
    if (!source) return null
    const copy: ResumeDoc = {
      ...source,
      id: crypto.randomUUID(),
      name: newName.trim() || `${source.name} 副本`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      optionsByTemplate: JSON.parse(JSON.stringify(source.optionsByTemplate)) as Record<string, StyleOptions>,
    }
    resumes.value = [...resumes.value, copy]
    activeResumeId.value = copy.id
    return copy.id
  }

  function renameResume(id: string, name: string) {
    const doc = resumes.value.find((r) => r.id === id)
    const trimmed = name.trim()
    if (doc && trimmed) {
      doc.name = trimmed
      doc.updatedAt = Date.now()
    }
  }

  /** 至少保留一份简历；删除当前简历时自动切到第一份 */
  function deleteResume(id: string): boolean {
    if (resumes.value.length <= 1) return false
    resumes.value = resumes.value.filter((r) => r.id !== id)
    if (activeResumeId.value === id) activeResumeId.value = resumes.value[0].id
    return true
  }

  function switchResume(id: string) {
    if (resumes.value.some((r) => r.id === id)) activeResumeId.value = id
  }

  /** 设置 / 移除当前简历的照片（本地原始分辨率 dataURL） */
  function setPhoto(dataUrl: string | null) {
    const doc = activeDoc.value
    if (!doc) return
    doc.photo = dataUrl ?? undefined
    doc.updatedAt = Date.now()
  }

  /** 照片显示缩放（1 = 模板默认尺寸） */
  function setPhotoScale(scale: number) {
    const doc = activeDoc.value
    if (!doc) return
    doc.photoScale = scale
    doc.updatedAt = Date.now()
  }

  // ---- 样式方案（全局库，应用时写入当前简历） ----

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
    const doc = activeDoc.value
    if (doc) {
      doc.optionsByTemplate = {
        ...doc.optionsByTemplate,
        [preset.templateId]: { ...preset.options },
      }
    }
    customCss.value = preset.customCss ?? ''
    touch()
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

  // ---- 长度提示（§3.6） ----

  /** 「压缩到目标页数」前的样式快照（撤销压缩用；仅内存，不入持久化） */
  const compressSnapshot = ref<StyleOptions | null>(null)

  function beginCompressSnapshot() {
    compressSnapshot.value = { ...styleOptions.value }
  }

  function restoreCompress() {
    const snap = compressSnapshot.value
    if (!snap) return
    const doc = activeDoc.value
    if (doc) {
      doc.optionsByTemplate = {
        ...doc.optionsByTemplate,
        [doc.templateId]: { ...snap },
      }
      doc.updatedAt = Date.now()
    }
    compressSnapshot.value = null
  }

  // localStorage 防抖 500ms 自动保存（§3.4）；版本号便于后续迁移
  let timer: ReturnType<typeof setTimeout> | undefined
  watch(
    [resumes, activeResumeId, presets, targetPages, locale],
    () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        try {
          const state: PersistedStateV2 = {
            version: 2,
            resumes: resumes.value,
            activeResumeId: activeResumeId.value,
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
    resumes,
    activeResumeId,
    activeDoc,
    presets,
    targetPages,
    locale,
    markdown,
    templateId,
    optionsByTemplate,
    customCss,
    styleOptions,
    setMarkdown,
    setTemplate,
    setOption,
    resetStyle,
    createResume,
    duplicateResume,
    renameResume,
    deleteResume,
    switchResume,
    setPhoto,
    setPhotoScale,
    savePreset,
    applyPreset,
    deletePreset,
    importPresets,
    compressSnapshot,
    beginCompressSnapshot,
    restoreCompress,
  }
})
