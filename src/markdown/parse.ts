import type {
  List,
  Paragraph,
  PhrasingContent,
  Root,
  RootContent,
  Table,
  Yaml,
} from 'mdast'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import { unified } from 'unified'
import { parse as parseYaml } from 'yaml'
import type {
  Basics,
  BasicsLink,
  ResumeData,
  ResumeItem,
  Section,
  SectionKind,
} from '@/types/resume'

const processor = unified().use(remarkParse).use(remarkGfm).use(remarkFrontmatter, ['yaml'])

/** 已知 frontmatter 链接字段 → 展示名 */
const LINK_LABELS: Record<string, string> = {
  github: 'GitHub',
  gitee: 'Gitee',
  linkedin: 'LinkedIn',
  homepage: '主页',
  website: '主页',
  blog: '博客',
}

/** 区块标题 → 区块类型。注意顺序：「教育经历」要先于泛匹配的「经历」 */
export function detectKind(title: string): SectionKind {
  const t = title.trim().toLowerCase()
  if (/教育|学业|学历|education/.test(t)) return 'education'
  if (/项目|project/.test(t)) return 'projects'
  if (/技能|技术栈|skill|stack/.test(t)) return 'skills'
  if (/工作|经历|实习|经验|work|experience|career/.test(t)) return 'work'
  return 'custom'
}

/** 时间段识别：含 4 位年份，且有区间符或「至今」类词 */
export function isDateLike(s: string): boolean {
  if (!/\d{4}/.test(s)) return false
  return /[-–—~]|至今|现在|当前|present|now/i.test(s)
}

/** `### 主体 | 副标题 | 时间段` → 三元组（§3.1 约定，支持全角｜） */
export function splitItemHeading(text: string): {
  title: string
  subtitle?: string
  date?: string
} {
  const parts = text
    .split(/[|｜]/)
    .map((p) => p.trim())
    .filter(Boolean)
  if (parts.length === 0) return { title: '' }

  const [title, ...rest] = parts
  let date: string | undefined
  if (rest.length > 0 && isDateLike(rest[rest.length - 1])) {
    date = rest.pop()
  }
  return { title, subtitle: rest.join(' | ') || undefined, date }
}

/** 行内节点集合 → 纯文本（用于标题、引言；丢失加粗等装饰是预期行为） */
export function nodesText(nodes: readonly PhrasingContent[]): string {
  return nodes
    .map((n) => {
      switch (n.type) {
        case 'text':
        case 'inlineCode':
        case 'html':
          return n.value
        case 'break':
          return ' '
        default:
          return 'children' in n ? nodesText(n.children) : ''
      }
    })
    .join('')
}

/** 用原始源串切片以保留行内语法（**加粗** 等）；position 缺失时退化为纯文本 */
function sliceSource(markdown: string, node: RootContent): string {
  const pos = node.position
  if (!pos || pos.start.offset == null || pos.end.offset == null) {
    return 'children' in node ? nodesText((node as Paragraph).children) : ''
  }
  return markdown.slice(pos.start.offset, pos.end.offset)
}

function listTexts(list: List, markdown: string): string[] {
  const out: string[] = []
  for (const li of list.children) {
    for (const child of li.children) {
      if (child.type === 'paragraph') {
        const text = sliceSource(markdown, child).trim()
        if (text) out.push(text)
      } else if (child.type === 'list') {
        out.push(...listTexts(child, markdown))
      }
    }
  }
  return out
}

function basicsFromYaml(raw: unknown): Basics {
  if (typeof raw !== 'object' || raw === null) return {}
  const data = raw as Record<string, unknown>
  const str = (key: string): string | undefined => {
    const v = data[key]
    const t = typeof v === 'number' ? String(v) : typeof v === 'string' ? v.trim() : ''
    return t || undefined
  }
  const basics: Basics = {
    name: str('name'),
    label: str('label'),
    phone: str('phone'),
    email: str('email'),
    location: str('location'),
    summary: str('summary'),
  }
  const links: BasicsLink[] = Object.entries(LINK_LABELS).flatMap(([key, label]) => {
    const url = str(key)
    return url ? [{ label, url }] : []
  })
  if (links.length > 0) basics.links = links
  return clean(basics)
}

/** 去掉值为 undefined 的键，避免覆盖已有字段 */
function clean<T extends object>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T
}

function createSection(title: string, data: ResumeData): Section {
  const kind = detectKind(title)
  let id: string = kind
  let n = 2
  while (data.sections.some((s) => s.id === id)) id = `${kind}-${n++}`
  return { id, title, kind, items: [], paragraphs: [] }
}

/**
 * Markdown → ResumeData。纯函数、宽松解析：不符合约定的内容兜底到
 * 区块 paragraphs 或「简介」区块，不丢弃、不抛错（设计文档 §3.1）。
 */
export function parseResume(markdown: string): ResumeData {
  const data: ResumeData = { basics: {}, sections: [] }
  if (!markdown.trim()) return data

  let tree: Root
  try {
    tree = processor.parse(markdown) as Root
  } catch {
    return data
  }

  let section: Section | null = null
  let item: ResumeItem | null = null
  let quoteSeen = false

  const pushSection = (title: string): Section => {
    const sec = createSection(title, data)
    data.sections.push(sec)
    return sec
  }
  const ensureSection = (): Section => section ?? (section = pushSection('简介'))

  for (const node of tree.children) {
    switch (node.type) {
      case 'yaml': {
        try {
          Object.assign(data.basics, basicsFromYaml(parseYaml((node as Yaml).value)))
        } catch {
          // 非法 YAML：跳过 frontmatter，正文继续
        }
        break
      }
      case 'heading': {
        const text = nodesText(node.children).trim()
        if (node.depth === 1) {
          // `# ` 优先于 frontmatter.name（§3.1）
          if (text) data.basics.name = text
        } else if (node.depth === 2) {
          section = pushSection(text || '其他')
          item = null
        } else {
          if (!section) section = pushSection('简介')
          const parsed = splitItemHeading(text)
          item = { title: parsed.title, subtitle: parsed.subtitle, date: parsed.date, bullets: [] }
          section.items.push(item)
        }
        break
      }
      case 'blockquote': {
        const text = node.children
          .filter((c) => c.type === 'paragraph')
          .map((p) => nodesText((p as Paragraph).children))
          .join(' ')
          .trim()
        if (!text) break
        // 第一条 `> ` 作为个人简介（优先于 frontmatter.summary），其余兜底为段落
        if (!quoteSeen) {
          data.basics.summary = text
          quoteSeen = true
        } else {
          ensureSection().paragraphs.push(text)
        }
        break
      }
      case 'list': {
        const texts = listTexts(node, markdown)
        if (texts.length === 0) break
        if (item) {
          item.bullets.push(...texts)
        } else {
          const sec = ensureSection()
          const last = sec.items[sec.items.length - 1]
          // 无 ### 的区块（如「技能」）：连续列表并入同一个隐式条目
          if (last && last.title === '' && last.bullets.length > 0) last.bullets.push(...texts)
          else sec.items.push({ title: '', bullets: texts })
        }
        break
      }
      case 'paragraph': {
        const text = sliceSource(markdown, node).trim()
        if (text) ensureSection().paragraphs.push(text)
        break
      }
      case 'table': {
        const sec = ensureSection()
        for (const row of (node as Table).children) {
          const text = row.children
            .map((cell) => nodesText(cell.children))
            .filter(Boolean)
            .join(' | ')
          if (text) sec.paragraphs.push(text)
        }
        break
      }
      default:
        break // html / 分隔线 / 脚注定义等：忽略，不算错误
    }
  }

  return data
}
