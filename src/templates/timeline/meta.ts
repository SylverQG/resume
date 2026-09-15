import type { TemplateMeta } from '@/types/resume'

import Timeline from './index.vue'

export const timelineMeta: TemplateMeta = {
  id: 'timeline',
  name: '时间轴',
  description: '竖向时间线 · 履历脉络清晰',
  thumbnail: `<svg viewBox="0 0 120 90" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="90" fill="#fff"/><rect x="14" y="10" width="24" height="4" rx="2" fill="#b45309"/><rect x="14" y="26" width="18" height="2.5" rx="1" fill="#94a3b8"/><line x1="42" y1="24" x2="42" y2="80" stroke="#dbe2ea" stroke-width="1.5"/><circle cx="42" cy="28" r="3" fill="#b45309"/><rect x="50" y="24" width="30" height="3" rx="1.5" fill="#475569"/><rect x="50" y="31" width="54" height="2" rx="1" fill="#e2e8f0"/><rect x="50" y="36" width="48" height="2" rx="1" fill="#e2e8f0"/><circle cx="42" cy="50" r="3" fill="#b45309"/><rect x="50" y="46" width="26" height="3" rx="1.5" fill="#475569"/><rect x="50" y="53" width="52" height="2" rx="1" fill="#e2e8f0"/><rect x="50" y="58" width="44" height="2" rx="1" fill="#e2e8f0"/><circle cx="42" cy="72" r="3" fill="#b45309"/><rect x="50" y="68" width="28" height="3" rx="1.5" fill="#475569"/></svg>`,
  defaults: {
    accentColor: '#b45309',
    fontFamily: 'sans',
    fontScale: 1,
    density: 'standard',
    headerLayout: 'left',
    sectionOrder: [],
    showIcons: false,
  },
  component: Timeline,
}
