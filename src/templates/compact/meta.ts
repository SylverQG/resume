import type { TemplateMeta } from '@/types/resume'

import Compact from './index.vue'

export const compactMeta: TemplateMeta = {
  id: 'compact',
  name: '紧凑一页',
  description: '小字号高密度 · 内容多压一页',
  thumbnail: `<svg viewBox="0 0 120 90" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="90" fill="#fff"/><rect x="10" y="8" width="20" height="3.5" rx="1.5" fill="#1d4ed8"/><rect x="34" y="9" width="22" height="2" rx="1" fill="#94a3b8"/><rect x="10" y="17" width="60" height="1.5" fill="#e2e8f0"/><rect x="10" y="23" width="22" height="2.5" rx="1" fill="#1d4ed8"/><rect x="10" y="29" width="34" height="2.5" rx="1" fill="#cbd5e1"/><rect x="10" y="34" width="66" height="1.5" rx="0.5" fill="#e2e8f0"/><rect x="10" y="38" width="60" height="1.5" rx="0.5" fill="#e2e8f0"/><rect x="10" y="43" width="64" height="1.5" rx="0.5" fill="#e2e8f0"/><rect x="10" y="51" width="22" height="2.5" rx="1" fill="#1d4ed8"/><rect x="10" y="57" width="30" height="2.5" rx="1" fill="#cbd5e1"/><rect x="10" y="62" width="68" height="1.5" rx="0.5" fill="#e2e8f0"/><rect x="10" y="66" width="62" height="1.5" rx="0.5" fill="#e2e8f0"/><rect x="10" y="70" width="58" height="1.5" rx="0.5" fill="#e2e8f0"/><rect x="10" y="74" width="64" height="1.5" rx="0.5" fill="#e2e8f0"/><rect x="10" y="78" width="52" height="1.5" rx="0.5" fill="#e2e8f0"/></svg>`,
  defaults: {
    accentColor: '#1d4ed8',
    fontFamily: 'sans',
    fontScale: 0.85,
    density: 'compact',
    headerLayout: 'center',
    sectionOrder: [],
    showIcons: false,
  },
  component: Compact,
}
