import type { TemplateMeta } from '@/types/resume'

import Cards from './index.vue'

export const cardsMeta: TemplateMeta = {
  id: 'cards',
  name: '卡片分区',
  description: '首字母头像 · 卡片式区块 · 现代产品风',
  thumbnail: `<svg viewBox="0 0 120 90" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="90" fill="#fff"/><rect x="10" y="10" width="18" height="18" rx="5" fill="#059669"/><text x="19" y="23.5" text-anchor="middle" font-size="10" font-weight="700" fill="#fff">张</text><rect x="34" y="13" width="30" height="4" rx="2" fill="#334155"/><rect x="34" y="21" width="44" height="2" rx="1" fill="#94a3b8"/><rect x="10" y="34" width="100" height="22" rx="5" fill="#fafbfd" stroke="#e5e9ef"/><rect x="16" y="40" width="22" height="3" rx="1.5" fill="#059669"/><rect x="16" y="47" width="60" height="2" rx="1" fill="#e2e8f0"/><rect x="10" y="60" width="100" height="22" rx="5" fill="#fafbfd" stroke="#e5e9ef"/><rect x="16" y="66" width="22" height="3" rx="1.5" fill="#059669"/><rect x="16" y="73" width="52" height="2" rx="1" fill="#e2e8f0"/></svg>`,
  defaults: {
    accentColor: '#059669',
    fontFamily: 'sans',
    fontScale: 1,
    density: 'standard',
    headerLayout: 'left',
    sectionOrder: [],
    showIcons: true,
  },
  component: Cards,
}
