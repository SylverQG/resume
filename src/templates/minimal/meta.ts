import type { TemplateMeta } from '@/types/resume'

import Minimal from './index.vue'

export const minimalMeta: TemplateMeta = {
  id: 'minimal',
  name: '极简',
  description: '无装饰 · 大留白 · 作品集气质',
  thumbnail: `<svg viewBox="0 0 120 90" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="90" fill="#fff"/><rect x="14" y="16" width="26" height="4" rx="2" fill="#111827"/><rect x="14" y="25" width="34" height="1.5" fill="#d1d5db"/><rect x="14" y="42" width="20" height="2.5" rx="1" fill="#9ca3af"/><rect x="14" y="50" width="70" height="2.5" rx="1" fill="#e5e7eb"/><rect x="14" y="56" width="62" height="2.5" rx="1" fill="#e5e7eb"/><rect x="14" y="68" width="16" height="2.5" rx="1" fill="#9ca3af"/><rect x="14" y="76" width="66" height="2.5" rx="1" fill="#e5e7eb"/></svg>`,
  defaults: {
    accentColor: '#111827',
    fontFamily: 'sans',
    fontScale: 1,
    density: 'relaxed',
    headerLayout: 'left',
    sectionOrder: [],
    showIcons: false,
  },
  component: Minimal,
}
