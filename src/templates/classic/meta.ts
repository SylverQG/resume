import type { TemplateMeta } from '@/types/resume'

import Classic from './index.vue'

export const classicMeta: TemplateMeta = {
  id: 'classic',
  name: '经典单栏',
  description: '居中头部 · 单栏顺排 · 通用投递',
  thumbnail: `<svg viewBox="0 0 120 90" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="90" fill="#fff"/><rect x="45" y="10" width="30" height="5" rx="2" fill="#334155"/><rect x="38" y="19" width="44" height="3" rx="1.5" fill="#94a3b8"/><rect x="15" y="30" width="90" height="2" fill="#1d4ed8"/><rect x="15" y="38" width="60" height="3" rx="1.5" fill="#cbd5e1"/><rect x="15" y="45" width="80" height="2" rx="1" fill="#e2e8f0"/><rect x="15" y="50" width="70" height="2" rx="1" fill="#e2e8f0"/><rect x="15" y="60" width="90" height="2" fill="#1d4ed8"/><rect x="15" y="68" width="55" height="3" rx="1.5" fill="#cbd5e1"/><rect x="15" y="75" width="75" height="2" rx="1" fill="#e2e8f0"/></svg>`,
  defaults: {
    accentColor: '#1d4ed8',
    fontFamily: 'sans',
    fontScale: 1,
    density: 'standard',
    headerLayout: 'center',
    sectionOrder: [],
    showIcons: false,
  },
  component: Classic,
}
