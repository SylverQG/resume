import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import { renderToString } from 'vue/server-renderer'

import { renderInline } from './inline'

const html = async (md: string) => renderToString(h('div', renderInline(md)))

describe('renderInline：行内 Markdown → VNode', () => {
  it('加粗 / 行内代码 / 链接', async () => {
    const out = await html('**加粗** 与 `code` 及 [链接](https://example.com)')
    expect(out).toContain('<strong>加粗</strong>')
    expect(out).toContain('<code>code</code>')
    expect(out).toContain('href="https://example.com"')
    expect(out).toContain('rel="noopener noreferrer"')
  })

  it('斜体与删除线（GFM）', async () => {
    const out = await html('*斜体* 和 ~~删除~~')
    expect(out).toContain('<em>斜体</em>')
    expect(out).toContain('<del>删除</del>')
  })

  it('纯文本原样保留，不产生多余标签', async () => {
    const out = await html('普通描述文本')
    expect(out).toContain('普通描述文本')
    expect(out).not.toContain('<strong')
  })

  it('链接内的加粗（嵌套行内）', async () => {
    const out = await html('[**项目主页**](https://example.com)')
    expect(out).toMatch(/<a [^>]*><strong>项目主页<\/strong><\/a>/)
  })
})
