import type { Section } from '@/types/resume'

/**
 * 按 sectionOrder 排序区块。order 缺失的区块（含失效 id）排在有序区块之后、
 * 保持原始相对顺序（Array.sort 为稳定排序）。
 */
export function applySectionOrder(sections: Section[], order: string[]): Section[] {
  if (order.length === 0) return sections
  const rank = new Map(order.map((id, i) => [id, i]))
  return [...sections].sort(
    (a, b) =>
      (rank.get(a.id) ?? Number.MAX_SAFE_INTEGER) - (rank.get(b.id) ?? Number.MAX_SAFE_INTEGER),
  )
}

/** 当前生效的区块顺序（供样式面板的上移/下移按钮操作） */
export function effectiveOrder(sections: Section[], order: string[]): string[] {
  return applySectionOrder(sections, order).map((s) => s.id)
}
