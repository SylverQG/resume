const SCOPE = '.resume-page'

function matchBrace(source: string, openIdx: number): number {
  let depth = 0
  for (let i = openIdx; i < source.length; i++) {
    if (source[i] === '{') depth++
    else if (source[i] === '}') {
      depth--
      if (depth === 0) return i
    }
  }
  return source.length - 1
}

/** 选择器组逐个加作用域前缀；已带前缀的保持原样 */
function scopeSelectorGroup(group: string, scope: string): string {
  return group
    .split(',')
    .map((raw) => raw.trim())
    .filter(Boolean)
    .map((sel) => (sel.startsWith(scope) ? sel : `${scope} ${sel}`))
    .join(', ')
}

/**
 * 给用户自定义 CSS 加 `.resume-page` 作用域（§3.6 L3）：
 * - 普通规则：每个选择器前加 `.resume-page `
 * - @media / @supports：保留条件，递归处理内部规则
 * - @font-face / @page / @keyframes 等：整体透传
 * - 已以 `.resume-page` 开头的选择器不重复前缀
 * 纯字符串实现（无 DOM/CSSOM 依赖），可在 Node 环境单测。
 */
export function scopeUserCss(css: string, scope: string = SCOPE): string {
  const out: string[] = []
  let i = 0

  while (i < css.length) {
    // 收集到下一个 '{' 之前的前奏（选择器 / @规则），保留途中注释
    const braceIdx = css.indexOf('{', i)
    if (braceIdx === -1) {
      // 无后续块的尾部（注释或残文），原样保留
      const tail = css.slice(i).trim()
      if (tail) out.push(tail)
      break
    }

    const prelude = css.slice(i, braceIdx).trim()
    const closeIdx = matchBrace(css, braceIdx)

    if (!prelude) {
      i = closeIdx + 1
      continue
    }

    if (prelude.startsWith('@')) {
      const body = css.slice(braceIdx + 1, closeIdx).trim()
      const lower = prelude.toLowerCase()
      if (lower.startsWith('@media') || lower.startsWith('@supports')) {
        out.push(`${prelude} { ${scopeUserCss(body, scope)} }`)
      } else {
        // @font-face / @page / @keyframes / 未知 @ 规则：原样透传
        out.push(`${prelude} { ${body} }`)
      }
      i = closeIdx + 1
      continue
    }

    const body = css.slice(braceIdx + 1, closeIdx)
    const scoped = scopeSelectorGroup(prelude, scope)
    if (scoped) out.push(`${scoped} { ${body.trim()} }`)
    i = closeIdx + 1
  }

  return out.join('\n')
}
