import { describe, expect, it } from 'vitest'

import { scopeUserCss } from './scopeUserCss'

describe('scopeUserCss：自定义 CSS 作用域处理', () => {
  it('普通选择器加 .resume-page 前缀', () => {
    expect(scopeUserCss('.r-name { color: red; }')).toBe('.resume-page .r-name { color: red; }')
  })

  it('选择器组逐个前缀', () => {
    const out = scopeUserCss('h1, .a > .b { margin: 0; }')
    expect(out).toBe('.resume-page h1, .resume-page .a > .b { margin: 0; }')
  })

  it('已带作用域的选择器不重复前缀', () => {
    expect(scopeUserCss('.resume-page .r-name { color: red; }')).toBe(
      '.resume-page .r-name { color: red; }',
    )
  })

  it('@media 保留条件并递归处理内部', () => {
    const out = scopeUserCss('@media print { .x { color: blue; } }')
    expect(out).toBe('@media print { .resume-page .x { color: blue; } }')
  })

  it('@font-face / @page / @keyframes 整体透传', () => {
    const css = [
      '@font-face { font-family: X; src: url(x.woff2); }',
      '@page { size: A4; }',
      '@keyframes spin { from { opacity: 0; } to { opacity: 1; } }',
    ].join('\n')
    expect(scopeUserCss(css)).toBe(css)
  })

  it('空输入返回空串', () => {
    expect(scopeUserCss('')).toBe('')
    expect(scopeUserCss('   \n ')).toBe('')
  })
})
