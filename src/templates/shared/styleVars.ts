import type { Density, StyleOptions } from '@/types/resume'

export const SANS_STACK =
  "-apple-system, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans SC', sans-serif"

export const SERIF_STACK = "'Songti SC', 'Noto Serif SC', 'SimSun', Georgia, serif"

/** 密度档位 → 间距/行高/页边距变量（模板只消费变量，不感知档位） */
const DENSITY_VARS: Record<Density, Record<string, string>> = {
  compact: {
    '--leading': '1.45',
    '--section-gap': '10px',
    '--item-gap': '5px',
    '--page-pad-y': '10mm',
    '--page-pad-x': '12mm',
  },
  standard: {
    '--leading': '1.55',
    '--section-gap': '14px',
    '--item-gap': '9px',
    '--page-pad-y': '13mm',
    '--page-pad-x': '15mm',
  },
  relaxed: {
    '--leading': '1.72',
    '--section-gap': '19px',
    '--item-gap': '13px',
    '--page-pad-y': '16mm',
    '--page-pad-x': '18mm',
  },
}

/** StyleOptions → 绑定在 .resume-page 上的 CSS Variables（§3.6 L2/L3 实现机制） */
export function styleVars(options: StyleOptions): Record<string, string> {
  const vars: Record<string, string> = {
    '--accent': options.accentColor,
    '--font-scale': String(options.fontScale),
    '--font-body': options.fontFamily === 'serif' ? SERIF_STACK : SANS_STACK,
    ...DENSITY_VARS[options.density],
  }
  // 专业调整覆盖（§3.7）
  if (typeof options.padY === 'number') vars['--page-pad-y'] = `${options.padY}mm`
  if (typeof options.padX === 'number') vars['--page-pad-x'] = `${options.padX}mm`
  return vars
}
