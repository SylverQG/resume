import { describe, expect, it } from 'vitest'

import type { StyleOptions } from '@/types/resume'

import { styleVars } from './styleVars'

const base: StyleOptions = {
  accentColor: '#1d4ed8',
  fontFamily: 'sans',
  fontScale: 1,
  density: 'standard',
  headerLayout: 'center',
  sectionOrder: [],
  showIcons: false,
}

describe('styleVars：StyleOptions → CSS Variables', () => {
  it('映射主题色与字号', () => {
    const vars = styleVars({ ...base, accentColor: '#ff0000', fontScale: 1.15 })
    expect(vars['--accent']).toBe('#ff0000')
    expect(vars['--font-scale']).toBe('1.15')
  })

  it('衬线字体切换字体栈', () => {
    expect(styleVars({ ...base, fontFamily: 'serif' })['--font-body']).toContain('SimSun')
    expect(styleVars({ ...base, fontFamily: 'sans' })['--font-body']).toContain('PingFang SC')
  })

  it('密度映射行高与页边距', () => {
    expect(styleVars({ ...base, density: 'compact' })['--leading']).toBe('1.45')
    expect(styleVars({ ...base, density: 'compact' })['--page-pad-y']).toBe('10mm')
    expect(styleVars({ ...base, density: 'relaxed' })['--leading']).toBe('1.72')
    expect(styleVars({ ...base, density: 'standard' })['--item-gap']).toBe('9px')
  })
})
