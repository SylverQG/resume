import { createI18n } from 'vue-i18n'

import en from './en'
import zhCN from './zh-CN'

export type Locale = 'zh-CN' | 'en'

/** 默认中文（设计文档 §3.8）；locale 的持久化在 resume store 中 */
export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: 'zh-CN',
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': zhCN,
    en,
  },
})
