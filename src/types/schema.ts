/**
 * 模板设计器的布局 Schema（M5，设计文档 §8）。
 * 设计器产出 JSON → SchemaRenderer 统一渲染；可导出/导入（上传即更新同 id 自定义模板）。
 */

export interface SchemaColors {
  accent: string
  text: string
  muted: string
  hairline: string
}

export interface TemplateSchema {
  /** 自定义模板 id（建议 custom- 前缀）；与内置模板 id 冲突时导入会重新生成 */
  id: string
  name: string
  page: { padY: number; padX: number; bg: string }
  colors: SchemaColors
  font: { family: 'sans' | 'serif'; scale: number }
  header: {
    show: boolean
    layout: 'center' | 'left'
    /** 'none' = 透明；否则为头部底色（横幅式） */
    bg: string
    /** 头部底色生效时的文字颜色 */
    bgText: string
    photo: { show: boolean; height: number }
    showSummary: boolean
  }
  body: { columns: 1 | 2; columnGap: number }
  section: {
    titleStyle: 'underline' | 'bar' | 'plain' | 'boxed'
    /** 区块顺序（section.id）；空 = 跟随 Markdown 原序 */
    order: string[]
    /** 隐藏的区块（id 或 kind） */
    hidden: string[]
    showIcons: boolean
    bullets: 'disc' | 'none' | 'dash'
    /** 「技能」类无标题区块渲染为标签胶囊 */
    skillChips: boolean
  }
}

export function defaultSchema(): TemplateSchema {
  return {
    id: '',
    name: '我的模板',
    page: { padY: 13, padX: 15, bg: '#ffffff' },
    colors: { accent: '#1d4ed8', text: '#1f2933', muted: '#52606d', hairline: '#e4e7eb' },
    font: { family: 'sans', scale: 1 },
    header: {
      show: true,
      layout: 'center',
      bg: 'none',
      bgText: '#ffffff',
      photo: { show: true, height: 84 },
      showSummary: true,
    },
    body: { columns: 1, columnGap: 26 },
    section: {
      titleStyle: 'underline',
      order: [],
      hidden: [],
      showIcons: true,
      bullets: 'disc',
      skillChips: false,
    },
  }
}

const str = (v: unknown, d: string) => (typeof v === 'string' && v.trim() ? v : d)
const num = (v: unknown, d: number) => (typeof v === 'number' && Number.isFinite(v) ? v : d)
const bool = (v: unknown, d: boolean) => (typeof v === 'boolean' ? v : d)
const pick = <T extends string>(v: unknown, list: readonly T[], d: T): T =>
  list.includes(v as T) ? (v as T) : d
const pickNum = <T extends number>(v: unknown, list: readonly T[], d: T): T =>
  list.includes(v as T) ? (v as T) : d
const strList = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []

/** 任意输入 → 合法 Schema：逐字段校验兜底，绝不抛错（用于导入与持久化读取） */
export function normalizeSchema(raw: unknown, fallbackId = ''): TemplateSchema | null {
  if (typeof raw !== 'object' || raw === null) return null
  const r = raw as Record<string, any>
  const d = defaultSchema()
  const page = r.page ?? {}
  const colors = r.colors ?? {}
  const font = r.font ?? {}
  const header = r.header ?? {}
  const photo = header.photo ?? {}
  const body = r.body ?? {}
  const section = r.section ?? {}

  const id = typeof r.id === 'string' && r.id.trim() ? r.id.trim() : fallbackId
  if (!id) return null

  return {
    id,
    name: str(r.name, '自定义模板'),
    page: {
      padY: num(page.padY, d.page.padY),
      padX: num(page.padX, d.page.padX),
      bg: str(page.bg, d.page.bg),
    },
    colors: {
      accent: str(colors.accent, d.colors.accent),
      text: str(colors.text, d.colors.text),
      muted: str(colors.muted, d.colors.muted),
      hairline: str(colors.hairline, d.colors.hairline),
    },
    font: {
      family: pick(font.family, ['sans', 'serif'] as const, 'sans'),
      scale: num(font.scale, 1),
    },
    header: {
      show: bool(header.show, true),
      layout: pick(header.layout, ['center', 'left'] as const, 'center'),
      bg: str(header.bg, 'none'),
      bgText: str(header.bgText, d.header.bgText),
      photo: { show: bool(photo.show, true), height: num(photo.height, 84) },
      showSummary: bool(header.showSummary, true),
    },
    body: {
      columns: pickNum(body.columns, [1, 2] as const, 1),
      columnGap: num(body.columnGap, d.body.columnGap),
    },
    section: {
      titleStyle: pick(section.titleStyle, ['underline', 'bar', 'plain', 'boxed'] as const, 'underline'),
      order: strList(section.order),
      hidden: strList(section.hidden),
      showIcons: bool(section.showIcons, true),
      bullets: pick(section.bullets, ['disc', 'none', 'dash'] as const, 'disc'),
      skillChips: bool(section.skillChips, false),
    },
  }
}

/** 导入文件的结构约定 */
export interface SchemaFile {
  type: 'resume-template-schema'
  version: 1
  schema: TemplateSchema
}

export function wrapSchemaFile(schema: TemplateSchema): SchemaFile {
  return { type: 'resume-template-schema', version: 1, schema }
}

export function unwrapSchemaFile(raw: unknown): TemplateSchema | null {
  if (typeof raw !== 'object' || raw === null) return null
  const r = raw as Record<string, unknown>
  const candidate = r.type === 'resume-template-schema' ? r.schema : r
  return normalizeSchema(candidate)
}
