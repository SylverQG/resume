import type { TemplateMeta } from '@/types/resume'

import Serif from './index.vue'

export const serifMeta: TemplateMeta = {
  id: 'serif',
  name: '雅致衬线',
  description: '衬线排印 · 双细线 · 学术/外企',
  thumbnail: `<svg viewBox="0 0 120 90" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="90" fill="#fff"/><rect x="40" y="12" width="40" height="5" rx="1" fill="#1e3a8a"/><rect x="48" y="21" width="24" height="2.5" rx="1" fill="#94a3b8"/><rect x="20" y="32" width="80" height="2.5" fill="#1e3a8a"/><rect x="20" y="34.5" width="80" height="1" fill="#1e3a8a"/><rect x="42" y="42" width="36" height="2.5" rx="1" fill="#94a3b8"/><rect x="24" y="50" width="32" height="3" rx="1.5" fill="#44403c"/><rect x="24" y="56" width="70" height="2" rx="1" fill="#e7e5e4"/><rect x="24" y="61" width="62" height="2" rx="1" fill="#e7e5e4"/><rect x="42" y="71" width="36" height="2.5" rx="1" fill="#94a3b8"/><rect x="24" y="79" width="34" height="3" rx="1.5" fill="#44403c"/></svg>`,
  defaults: {
    accentColor: '#1e3a8a',
    fontFamily: 'serif',
    fontScale: 1,
    density: 'relaxed',
    headerLayout: 'center',
    sectionOrder: [],
    showIcons: false,
  },
  component: Serif,
}
