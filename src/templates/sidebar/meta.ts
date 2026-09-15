import type { TemplateMeta } from '@/types/resume'

import Sidebar from './index.vue'

export const sidebarMeta: TemplateMeta = {
  id: 'sidebar',
  name: '双栏侧栏',
  description: '左栏联系/技能 · 右栏经历 · 信息密度高',
  thumbnail: `<svg viewBox="0 0 120 90" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="90" fill="#fff"/><rect x="8" y="8" width="36" height="74" rx="3" fill="#eef2f7"/><rect x="13" y="15" width="26" height="4" rx="2" fill="#0f766e"/><rect x="13" y="23" width="18" height="2" rx="1" fill="#94a3b8"/><rect x="13" y="30" width="24" height="2" rx="1" fill="#94a3b8"/><rect x="13" y="40" width="20" height="2.5" rx="1" fill="#475569"/><rect x="13" y="47" width="26" height="2" rx="1" fill="#cbd5e1"/><rect x="13" y="52" width="22" height="2" rx="1" fill="#cbd5e1"/><rect x="52" y="14" width="34" height="3.5" rx="1.5" fill="#0f766e"/><rect x="52" y="24" width="40" height="3" rx="1.5" fill="#cbd5e1"/><rect x="52" y="30" width="56" height="2" rx="1" fill="#e2e8f0"/><rect x="52" y="35" width="50" height="2" rx="1" fill="#e2e8f0"/><rect x="52" y="46" width="30" height="3.5" rx="1.5" fill="#0f766e"/><rect x="52" y="55" width="42" height="3" rx="1.5" fill="#cbd5e1"/><rect x="52" y="61" width="58" height="2" rx="1" fill="#e2e8f0"/><rect x="52" y="66" width="52" height="2" rx="1" fill="#e2e8f0"/></svg>`,
  defaults: {
    accentColor: '#0f766e',
    fontFamily: 'sans',
    fontScale: 1,
    density: 'standard',
    headerLayout: 'left',
    sectionOrder: [],
    showIcons: true,
  },
  component: Sidebar,
}
