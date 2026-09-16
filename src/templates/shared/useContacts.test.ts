import { describe, expect, it } from 'vitest'

import { contactItems } from './useContacts'

describe('contactItems：纸质化展示文本', () => {
  it('链接型展示为去协议域名，不再生成可点击链接', () => {
    const items = contactItems({
      links: [
        { label: 'GitHub', url: 'https://github.com/zhangsan' },
        { label: '博客', url: 'https://blog.zhangsan.dev/' },
      ],
    })
    expect(items.map((i) => i.text)).toEqual(['github.com/zhangsan', 'blog.zhangsan.dev'])
    expect(items[0].icon).toBe('github')
  })

  it('账号型（微信/QQ 等）展示为「平台 账号」', () => {
    const items = contactItems({
      links: [
        { label: '微信', url: 'zhangsan_123' },
        { label: 'QQ', url: '123456789' },
      ],
    })
    expect(items.map((i) => i.text)).toEqual(['微信 zhangsan_123', 'QQ 123456789'])
  })

  it('电话 / 邮箱 / 地理位置原样展示', () => {
    const items = contactItems({ phone: '138xxxx0000', email: 'a@b.c', location: '上海' })
    expect(items.map((i) => i.text)).toEqual(['138xxxx0000', 'a@b.c', '上海'])
    expect(items.map((i) => i.icon)).toEqual(['phone', 'email', 'location'])
  })

  it('基础信息为空时返回空数组', () => {
    expect(contactItems({})).toEqual([])
  })
})
