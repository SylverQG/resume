import type { TemplateMeta } from '@/types/resume'

import Twocolumn from './index.vue'

export const twocolumnMeta: TemplateMeta = {
  id: 'twocolumn',
  name: '双栏报刊',
  description: '正文双栏流动 · 信息密度高',
  thumbnail: `<svg viewBox="0 0 120 90" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="90" fill="#fff"/><rect x="10" y="10" width="26" height="4" rx="1.5" fill="#0e7490"/><rect x="74" y="10" width="36" height="2" rx="1" fill="#94a3b8"/><rect x="74" y="15" width="30" height="2" rx="1" fill="#94a3b8"/><rect x="10" y="20" width="100" height="2" fill="#0e7490"/><rect x="10" y="28" width="18" height="2.5" rx="1" fill="#0e7490"/><rect x="10" y="34" width="44" height="2" rx="1" fill="#cbd5e1"/><rect x="10" y="39" width="40" height="2" rx="1" fill="#e2e8f0"/><rect x="10" y="44" width="42" height="2" rx="1" fill="#e2e8f0"/><rect x="10" y="53" width="16" height="2.5" rx="1" fill="#0e7490"/><rect x="10" y="59" width="40" height="2" rx="1" fill="#e2e8f0"/><rect x="10" y="64" width="36" height="2" rx="1" fill="#e2e8f0"/><rect x="66" y="28" width="18" height="2.5" rx="1" fill="#0e7490"/><rect x="66" y="34" width="42" height="2" rx="1" fill="#e2e8f0"/><rect x="66" y="39" width="38" height="2" rx="1" fill="#e2e8f0"/><rect x="66" y="48" width="16" height="2.5" rx="1" fill="#0e7490"/><rect x="66" y="54" width="44" height="2" rx="1" fill="#e2e8f0"/><rect x="66" y="59" width="40" height="2" rx="1" fill="#e2e8f0"/></svg>`,
  defaults: {
    accentColor: '#0e7490',
    fontFamily: 'sans',
    fontScale: 1,
    density: 'standard',
    headerLayout: 'left',
    sectionOrder: [],
    showIcons: false,
  },
  component: Twocolumn,
}
