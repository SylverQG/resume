import type { TemplateMeta } from '@/types/resume'

import Swiss from './index.vue'

export const swissMeta: TemplateMeta = {
  id: 'swiss',
  name: '瑞士栅格',
  description: '粗黑大字头 · 区块编号 · 强网格',
  thumbnail: `<svg viewBox="0 0 120 90" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="90" fill="#fff"/><rect x="12" y="12" width="34" height="7" rx="1" fill="#111"/><rect x="12" y="22" width="16" height="3" rx="1" fill="#dc2626"/><rect x="76" y="13" width="32" height="2" rx="1" fill="#9ca3af"/><rect x="76" y="18" width="26" height="2" rx="1" fill="#9ca3af"/><rect x="12" y="38" width="96" height="2.5" fill="#111"/><text x="12" y="49" font-size="8" font-weight="800" fill="#dc2626">01</text><rect x="30" y="43" width="20" height="4" rx="1.5" fill="#111"/><rect x="12" y="54" width="64" height="2" rx="1" fill="#d1d5db"/><rect x="12" y="59" width="58" height="2" rx="1" fill="#e5e7eb"/><rect x="12" y="68" width="96" height="2.5" fill="#111"/><text x="12" y="79" font-size="8" font-weight="800" fill="#dc2626">02</text><rect x="30" y="73" width="18" height="4" rx="1.5" fill="#111"/></svg>`,
  defaults: {
    accentColor: '#dc2626',
    fontFamily: 'sans',
    fontScale: 1,
    density: 'standard',
    headerLayout: 'left',
    sectionOrder: [],
    showIcons: false,
  },
  component: Swiss,
}
