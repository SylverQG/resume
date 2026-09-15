import type { TemplateMeta } from '@/types/resume'

import Banner from './index.vue'

export const bannerMeta: TemplateMeta = {
  id: 'banner',
  name: '顶栏横幅',
  description: '主题色横幅 · 技能标签化',
  thumbnail: `<svg viewBox="0 0 120 90" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="90" fill="#fff"/><rect width="120" height="26" fill="#4338ca"/><rect x="42" y="8" width="36" height="4.5" rx="2" fill="#fff"/><rect x="34" y="17" width="52" height="2" rx="1" fill="rgba(255,255,255,.75)"/><rect x="14" y="34" width="30" height="3" rx="1.5" fill="#4338ca"/><rect x="14" y="42" width="50" height="3" rx="1.5" fill="#cbd5e1"/><rect x="14" y="48" width="80" height="2" rx="1" fill="#e2e8f0"/><rect x="14" y="60" width="26" height="3" rx="1.5" fill="#4338ca"/><rect x="14" y="68" width="18" height="7" rx="3.5" fill="#eef2ff"/><rect x="36" y="68" width="22" height="7" rx="3.5" fill="#eef2ff"/><rect x="62" y="68" width="20" height="7" rx="3.5" fill="#eef2ff"/></svg>`,
  defaults: {
    accentColor: '#4338ca',
    fontFamily: 'sans',
    fontScale: 1,
    density: 'standard',
    headerLayout: 'center',
    sectionOrder: [],
    showIcons: true,
  },
  component: Banner,
}
