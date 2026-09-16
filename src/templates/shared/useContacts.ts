import type { Basics } from '@/types/resume'

export interface ContactItem {
  icon: string | null
  /** 展示文本（纸质友好，不渲染为超链接）：链接型为去协议域名，账号型为「平台 账号」 */
  text: string
  /** 原始值（链接或账号 ID），模板当前不使用 */
  url?: string
}

/** ID 型社交账号：展示为「平台名 账号」，而非域名 */
const ID_STYLE_LABELS = new Set(['微信', 'QQ', '微博', '小红书', 'WeChat', 'Weibo'])

function stripProtocol(value: string): string {
  return value.replace(/^https?:\/\//i, '').replace(/\/$/, '')
}

function iconForLink(label: string): string {
  const l = label.toLowerCase()
  if (l.includes('github')) return 'github'
  if (l.includes('微信') || l.includes('wechat') || l === 'qq') return 'chat'
  if (l.includes('微博') || l.includes('weibo') || l.includes('小红书')) return 'globe'
  return 'link'
}

/** basics → 统一的联系方式条目（图标 + 纸质化展示文本），供各模板复用 */
export function contactItems(basics: Basics): ContactItem[] {
  const items: ContactItem[] = []
  if (basics.phone) items.push({ icon: 'phone', text: basics.phone })
  if (basics.email) items.push({ icon: 'email', text: basics.email })
  if (basics.location) items.push({ icon: 'location', text: basics.location })
  for (const link of basics.links ?? []) {
    const value = stripProtocol(link.url)
    items.push({
      icon: iconForLink(link.label),
      text: ID_STYLE_LABELS.has(link.label) ? `${link.label} ${value}` : value,
      url: link.url,
    })
  }
  return items
}
