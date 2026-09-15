import type { TemplateMeta } from '@/types/resume'

import { bannerMeta } from './banner/meta'
import { cardsMeta } from './cards/meta'
import { classicMeta } from './classic/meta'
import { compactMeta } from './compact/meta'
import { ledgerMeta } from './ledger/meta'
import { minimalMeta } from './minimal/meta'
import { raildarkMeta } from './raildark/meta'
import { serifMeta } from './serif/meta'
import { sidebarMeta } from './sidebar/meta'
import { swissMeta } from './swiss/meta'
import { timelineMeta } from './timeline/meta'
import { twocolumnMeta } from './twocolumn/meta'

/**
 * 模板注册表：新增模板 = 新增 templates/{id}/ 目录（index.vue + meta.ts）+ 在此登记。
 */
export const templates: TemplateMeta[] = [
  classicMeta,
  sidebarMeta,
  minimalMeta,
  timelineMeta,
  bannerMeta,
  compactMeta,
  serifMeta,
  twocolumnMeta,
  cardsMeta,
  raildarkMeta,
  swissMeta,
  ledgerMeta,
]

export function getTemplate(id: string): TemplateMeta {
  return templates.find((t) => t.id === id) ?? templates[0]
}
