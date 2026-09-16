import type { ResumeData, ResumeItem } from '@/types/resume'
import type { Locale } from '@/i18n'

/**
 * JSON Resume（jsonresume.org）近似映射：
 * - 日期保留原始写法（"2021.07 - 至今"），仅按 " - " 切分 start/end，往返一致
 * - 自定义区块归入 projects（该 schema 无自定义区块概念）
 * - 导出为宽松结构；导入时逐字段校验、容错缺失
 */

const SECTION_TITLES: Record<Locale, Record<string, string>> = {
  'zh-CN': {
    work: '工作经历',
    education: '教育经历',
    projects: '项目经历',
    skills: '技能',
  },
  en: {
    work: 'Work Experience',
    education: 'Education',
    projects: 'Projects',
    skills: 'Skills',
  },
}

function clean<T extends object>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T
}

/** "2021.07 - 至今" → ["2021.07", "至今"]（要求区间符两侧有空白，避免切断 2017.09-2021.06 类紧凑写法以外的情况误判） */
function splitRange(date?: string): [string | undefined, string | undefined] {
  if (!date) return [undefined, undefined]
  const m = date.split(/\s+[-–—~]\s+/)
  return m.length >= 2 ? [m[0], m.slice(1).join(' - ')] : [date, undefined]
}

function itemsOf(data: ResumeData, kind: string): ResumeItem[] {
  return data.sections.filter((s) => s.kind === kind).flatMap((s) => s.items)
}

export function toJsonResume(data: ResumeData): Record<string, unknown> {
  const b = data.basics
  const basics = clean({
    name: b.name,
    label: b.label,
    email: b.email,
    phone: b.phone,
    location: b.location ? { region: b.location } : undefined,
    summary: b.summary,
    profiles: b.links?.map((l) => ({ network: l.label, url: l.url })),
  })

  const withFallback = (kind: string, entry: (it: ResumeItem) => Record<string, unknown>) => {
    const items = itemsOf(data, kind)
    if (items.length === 0) return undefined
    const titled = items.filter((it) => it.title)
    if (titled.length === 0) {
      // 无 ### 条目的区块：整块作为一条目（区块标题充当 name）
      const section = data.sections.find((s) => s.kind === kind)
      return [entry({ title: section?.title ?? '', bullets: items.flatMap((it) => it.bullets) })]
    }
    return titled.map(entry)
  }

  const work = withFallback('work', (it) => {
    const [startDate, endDate] = splitRange(it.date)
    return clean({
      name: it.title,
      position: it.subtitle,
      startDate,
      endDate,
      highlights: it.bullets.length ? it.bullets : undefined,
    })
  })

  const education = withFallback('education', (it) => {
    const [startDate, endDate] = splitRange(it.date)
    return clean({
      institution: it.title,
      area: it.subtitle,
      startDate,
      endDate,
      highlights: it.bullets.length ? it.bullets : undefined,
    })
  })

  const projects = withFallback('projects', (it) =>
    clean({
      name: it.title,
      description: it.subtitle,
      highlights: it.bullets.length ? it.bullets : undefined,
    }),
  )

  const skillBullets = itemsOf(data, 'skills').flatMap((it) => it.bullets)
  const skills = skillBullets.length ? skillBullets.map((line) => ({ name: line })) : undefined

  return clean({ basics, work, education, projects, skills })
}

const LINK_KEYS = [
  'github',
  'gitee',
  'linkedin',
  'wechat',
  'qq',
  'weibo',
  'xiaohongshu',
  'twitter',
  'x',
  'instagram',
  'facebook',
  'telegram',
  'blog',
  'homepage',
] as const

function linkKey(network: string): (typeof LINK_KEYS)[number] {
  const zhToKey: Record<string, (typeof LINK_KEYS)[number]> = {
    微信: 'wechat',
    微博: 'weibo',
    小红书: 'xiaohongshu',
    主页: 'homepage',
    博客: 'blog',
  }
  if (zhToKey[network]) return zhToKey[network]
  const n = network.toLowerCase()
  return (LINK_KEYS.find((k) => n.includes(k)) ?? 'homepage') as (typeof LINK_KEYS)[number]
}

/** JSON Resume → Markdown（写入编辑器，走既有解析链路） */
export function fromJsonResume(jr: unknown, locale: Locale): string {
  const data = (typeof jr === 'object' && jr !== null ? jr : {}) as Record<string, any>
  const titles = SECTION_TITLES[locale] ?? SECTION_TITLES['zh-CN']
  const b = (typeof data.basics === 'object' && data.basics !== null ? data.basics : {}) as Record<string, any>

  const fm: Record<string, string> = {}
  const put = (k: string, v: unknown) => {
    const s = typeof v === 'string' ? v.trim() : typeof v === 'number' ? String(v) : ''
    if (s) fm[k] = s
  }
  put('name', b.name)
  put('label', b.label)
  put('email', b.email)
  put('phone', b.phone)
  const location = b.location
  if (typeof location === 'object' && location !== null) {
    put('location', [location.city, location.region].filter(Boolean).join(', '))
  }
  for (const p of Array.isArray(b.profiles) ? b.profiles : []) {
    if (typeof p?.url === 'string' && p.url) {
      fm[linkKey(String(p.network ?? ''))] = p.url
    }
  }

  const lines: string[] = []
  if (Object.keys(fm).length > 0) {
    lines.push(
      '---',
      ...Object.entries(fm).map(([k, v]) => `${k}: '${v.replace(/'/g, "''")}'`),
      '---',
      '',
    )
  }
  if (fm.name) lines.push(`# ${fm.name}`, '')
  if (typeof b.summary === 'string' && b.summary.trim()) {
    lines.push(`> ${b.summary.trim()}`, '')
  }

  const range = (s: unknown, e: unknown): string => {
    const parts = [s, e].map((v) => (typeof v === 'string' ? v.trim() : '')).filter(Boolean)
    return parts.join(' - ')
  }

  const emitItems = (
    title: string,
    entries: any[],
    heading: (it: any) => string,
    extra?: (it: any) => [string, string][],
  ) => {
    if (!Array.isArray(entries) || entries.length === 0) return
    lines.push(`## ${title}`, '')
    for (const it of entries) {
      if (typeof it !== 'object' || it === null) continue
      const head = heading(it)
      if (head) lines.push(head)
      for (const [label, value] of extra?.(it) ?? []) {
        if (value) lines.push(`${label}${value}`)
      }
      for (const h of Array.isArray(it.highlights) ? it.highlights : []) {
        if (typeof h === 'string' && h.trim()) lines.push(`- ${h.trim()}`)
      }
      lines.push('')
    }
  }

  emitItems(titles.work, data.work, (it) =>
    ['### ', [it.name, it.position, range(it.startDate, it.endDate)].filter(Boolean).join(' | ')].join(''),
  )
  emitItems(titles.education, data.education, (it) =>
    ['### ', [it.institution, [it.studyType, it.area].filter(Boolean).join(' · '), range(it.startDate, it.endDate)].filter(Boolean).join(' | ')].join(''),
  )
  emitItems(titles.projects, data.projects, (it) =>
    ['### ', [it.name, it.description].filter(Boolean).join(' | ')].join(''),
  )

  if (Array.isArray(data.skills) && data.skills.length > 0) {
    lines.push(`## ${titles.skills}`, '')
    for (const s of data.skills) {
      const text = typeof s === 'string' ? s : typeof s?.name === 'string' ? s.name : ''
      if (text.trim()) lines.push(`- ${text.trim()}`)
    }
    lines.push('')
  }

  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n'
}
