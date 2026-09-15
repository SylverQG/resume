import { describe, expect, it } from 'vitest'

import type { Section } from '@/types/resume'

import { applySectionOrder, effectiveOrder } from './sectionOrder'

const mk = (id: string): Section => ({ id, title: id, kind: 'custom', items: [], paragraphs: [] })

describe('applySectionOrder', () => {
  it('空 order → 保持 Markdown 原序', () => {
    const sections = [mk('work'), mk('education')]
    expect(applySectionOrder(sections, [])).toEqual(sections)
  })

  it('按 order 升序，未列出的排后且保持稳定', () => {
    const sections = [mk('work'), mk('education'), mk('projects'), mk('skills')]
    const out = applySectionOrder(sections, ['skills', 'education'])
    expect(out.map((s) => s.id)).toEqual(['skills', 'education', 'work', 'projects'])
  })

  it('order 含失效 id → 忽略，不报错', () => {
    const sections = [mk('work'), mk('education')]
    const out = applySectionOrder(sections, ['ghost', 'education'])
    expect(out.map((s) => s.id)).toEqual(['education', 'work'])
  })
})

describe('effectiveOrder', () => {
  it('返回当前生效顺序（供面板上移/下移操作）', () => {
    const sections = [mk('work'), mk('skills')]
    expect(effectiveOrder(sections, ['skills'])).toEqual(['skills', 'work'])
    expect(effectiveOrder(sections, [])).toEqual(['work', 'skills'])
  })
})
