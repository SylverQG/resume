import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

// Node 环境无 localStorage：用 Map 桩替代（store 模块在 setup 时才读取，导入顺序安全）
const backing = new Map<string, string>()
vi.stubGlobal('localStorage', {
  getItem: (k: string) => backing.get(k) ?? null,
  setItem: (k: string, v: string) => void backing.set(k, v),
  removeItem: (k: string) => void backing.delete(k),
})

import { useResumeStore } from './useResumeStore'

const KEY = 'resume-app:v1'

beforeEach(() => {
  backing.clear()
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-09-15T00:00:00Z'))
  setActivePinia(createPinia())
})

afterEach(() => {
  vi.useRealTimers()
})

describe('store：全新状态', () => {
  it('初始创建一份含示例的简历', async () => {
    const store = useResumeStore()
    expect(store.resumes).toHaveLength(1)
    expect(store.resumes[0].name).toBe('简历 1')
    expect(store.markdown).toContain('张三')
  })
})

describe('store：v1 → v2 迁移', () => {
  it('旧单简历状态迁移为一份简历，外观字段完整保留', async () => {
    backing.set(
      KEY,
      JSON.stringify({
        version: 1,
        markdown: '# 旧简历',
        templateId: 'sidebar',
        optionsByTemplate: { sidebar: { accentColor: '#0f766e' } },
        customCss: '.x { color: red; }',
        presets: [
          { id: 'p1', name: '方案', templateId: 'classic', options: { accentColor: '#000000' } },
        ],
        targetPages: 2,
        locale: 'zh-CN',
      }),
    )
    const store = useResumeStore()
    expect(store.resumes).toHaveLength(1)
    expect(store.resumes[0].markdown).toBe('# 旧简历')
    expect(store.resumes[0].templateId).toBe('sidebar')
    expect(store.customCss).toBe('.x { color: red; }')
    expect(store.presets).toHaveLength(1)
    expect(store.targetPages).toBe(2)
    expect(store.activeResumeId).toBe(store.resumes[0].id)
  })

  it('非法模板 id 回退 classic，损坏 JSON 走默认状态', async () => {
    backing.set(KEY, JSON.stringify({ version: 1, markdown: 'x', templateId: 'ghost' }))
    const store = useResumeStore()
    expect(store.templateId).toBe('classic')

    backing.set(KEY, '{oops')
    setActivePinia(createPinia()) // 新 pinia 实例 → 重新走 loadState
    const store2 = useResumeStore()
    expect(store2.resumes).toHaveLength(1)
    expect(store2.resumes[0].markdown).toContain('张三')
  })
})

describe('store：多简历 CRUD', () => {
  it('新建 / 复制 / 重命名 / 删除 / 切换', async () => {
    const store = useResumeStore()
    const firstId = store.activeResumeId

    const newId = store.createResume('投 A 公司')
    expect(store.resumes).toHaveLength(2)
    expect(store.activeResumeId).toBe(newId)
    expect(store.markdown).toBe('') // 新简历为空

    const copyId = store.duplicateResume(newId, '投 A 公司 副本')
    if (copyId === null) throw new Error('duplicate failed')
    expect(copyId).not.toBe(newId)
    expect(store.resumes).toHaveLength(3)
    expect(store.activeResumeId).toBe(copyId)
    expect(store.markdown).toBe('') // 复制内容一致

    store.renameResume(copyId, '  改名  ')
    expect(store.resumes.find((r) => r.id === copyId)?.name).toBe('改名')

    store.switchResume(firstId)
    expect(store.activeResumeId).toBe(firstId)

    expect(store.deleteResume(copyId)).toBe(true)
    expect(store.resumes).toHaveLength(2)

    // 删除当前简历后自动切到第一份
    store.switchResume(newId)
    store.deleteResume(newId)
    expect(store.activeResumeId).toBe(firstId)

    // 最后一一份不可删除
    store.deleteResume(firstId)
    expect(store.resumes).toHaveLength(1)
    expect(store.deleteResume(firstId)).toBe(false)
    expect(store.resumes).toHaveLength(1)
  })

  it('外观按简历隔离：模板切换互不影响', async () => {
    const store = useResumeStore()
    const idA = store.activeResumeId
    store.setTemplate('sidebar')

    const idB = store.createResume('B')
    expect(store.templateId).toBe('classic') // 新简历用默认模板
    store.setTemplate('swiss')
    store.setOption('accentColor', '#ff0000')

    store.switchResume(idA)
    expect(store.templateId).toBe('sidebar')
    store.switchResume(idB)
    expect(store.templateId).toBe('swiss')
    expect(store.styleOptions.accentColor).toBe('#ff0000')
  })
})

describe('store：持久化', () => {
  it('防抖 500ms 后写入 version 2 结构', async () => {
    const store = useResumeStore()
    store.setMarkdown('# hello')
    store.createResume('第二份')

    expect(backing.has(KEY)).toBe(false) // 未到防抖时间
    await vi.advanceTimersByTimeAsync(500)

    const saved = JSON.parse(backing.get(KEY)!)
    expect(saved.version).toBe(2)
    expect(saved.resumes).toHaveLength(2)
    expect(saved.resumes[0].markdown).toBe('# hello')
    expect(saved.activeResumeId).toBe(saved.resumes[1].id)
  })

  it('方案保存时携带当前自定义 CSS，应用时恢复', async () => {
    const store = useResumeStore()
    store.customCss = '.r-name { color: red; }'
    expect(store.savePreset('红名')).not.toBeNull()

    store.customCss = ''
    store.applyPreset(store.presets[0].id)
    expect(store.customCss).toBe('.r-name { color: red; }')
  })
})
