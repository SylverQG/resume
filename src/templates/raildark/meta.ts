import type { TemplateMeta } from '@/types/resume'

import Raildark from './index.vue'

export const raildarkMeta: TemplateMeta = {
  id: 'raildark',
  name: '深色右栏',
  description: '右侧深栏反白 · 联系/技能置右',
  thumbnail: `<svg viewBox="0 0 120 90" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="90" fill="#fff"/><rect x="76" y="0" width="44" height="90" fill="#334155"/><rect x="82" y="12" width="24" height="3.5" rx="1.5" fill="rgba(255,255,255,.9)"/><rect x="82" y="21" width="30" height="2" rx="1" fill="rgba(255,255,255,.55)"/><rect x="82" y="26" width="26" height="2" rx="1" fill="rgba(255,255,255,.55)"/><rect x="82" y="38" width="20" height="2.5" rx="1" fill="rgba(255,255,255,.9)"/><rect x="82" y="45" width="32" height="2" rx="1" fill="rgba(255,255,255,.55)"/><rect x="82" y="50" width="28" height="2" rx="1" fill="rgba(255,255,255,.55)"/><rect x="10" y="12" width="28" height="4.5" rx="2" fill="#334155"/><rect x="10" y="21" width="18" height="2" rx="1" fill="#334155"/><rect x="10" y="34" width="24" height="3" rx="1.5" fill="#334155"/><rect x="10" y="42" width="52" height="2.5" rx="1" fill="#cbd5e1"/><rect x="10" y="48" width="48" height="2" rx="1" fill="#e2e8f0"/><rect x="10" y="60" width="24" height="3" rx="1.5" fill="#334155"/><rect x="10" y="68" width="54" height="2.5" rx="1" fill="#cbd5e1"/><rect x="10" y="74" width="50" height="2" rx="1" fill="#e2e8f0"/></svg>`,
  defaults: {
    accentColor: '#334155',
    fontFamily: 'sans',
    fontScale: 1,
    density: 'standard',
    headerLayout: 'left',
    sectionOrder: [],
    showIcons: true,
  },
  component: Raildark,
}
