import type { TemplateMeta } from '@/types/resume'

import Ledger from './index.vue'

export const ledgerMeta: TemplateMeta = {
  id: 'ledger',
  name: '表格左标签',
  description: '左标签右内容 · 发丝线分行 · 欧式表格式',
  thumbnail: `<svg viewBox="0 0 120 90" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="90" fill="#fff"/><rect x="10" y="10" width="28" height="4.5" rx="1.5" fill="#111827"/><rect x="70" y="11" width="40" height="2" rx="1" fill="#9ca3af"/><rect x="70" y="16" width="34" height="2" rx="1" fill="#9ca3af"/><rect x="10" y="24" width="100" height="1.5" fill="#111827"/><rect x="10" y="32" width="18" height="2.5" rx="1" fill="#6d28d9"/><rect x="38" y="32" width="30" height="2.5" rx="1" fill="#4b5563"/><rect x="84" y="32" width="26" height="2" rx="1" fill="#9ca3af"/><rect x="38" y="38" width="56" height="2" rx="1" fill="#e5e7eb"/><rect x="38" y="43" width="50" height="2" rx="1" fill="#e5e7eb"/><rect x="10" y="52" width="100" height="1" fill="#eef1f4"/><rect x="10" y="60" width="16" height="2.5" rx="1" fill="#6d28d9"/><rect x="38" y="60" width="26" height="2.5" rx="1" fill="#4b5563"/><rect x="38" y="66" width="60" height="2" rx="1" fill="#e5e7eb"/><rect x="38" y="71" width="54" height="2" rx="1" fill="#e5e7eb"/><rect x="10" y="80" width="100" height="1" fill="#eef1f4"/></svg>`,
  defaults: {
    accentColor: '#6d28d9',
    fontFamily: 'sans',
    fontScale: 1,
    density: 'standard',
    headerLayout: 'left',
    sectionOrder: [],
    showIcons: false,
  },
  component: Ledger,
}
