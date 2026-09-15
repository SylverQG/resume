import type { Basics } from '@/types/resume'

export interface ContactItem {
  icon: string
  text: string
  url?: string
}

function iconForLink(label: string): string {
  const l = label.toLowerCase()
  if (l.includes('github')) return 'github'
  return 'link'
}

/** basics → 统一的联系方式条目（图标 + 文本 + 可选链接），供各模板复用 */
export function contactItems(basics: Basics): ContactItem[] {
  const items: ContactItem[] = []
  if (basics.phone) items.push({ icon: 'phone', text: basics.phone })
  if (basics.email) items.push({ icon: 'email', text: basics.email })
  if (basics.location) items.push({ icon: 'location', text: basics.location })
  for (const link of basics.links ?? []) {
    items.push({ icon: iconForLink(link.label), text: link.label, url: link.url })
  }
  return items
}
