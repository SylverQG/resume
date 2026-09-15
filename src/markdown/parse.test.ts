import { describe, expect, it } from 'vitest'

import { sampleZh } from './samples/sample.zh'
import { detectKind, isDateLike, parseResume, splitItemHeading } from './parse'

describe('parseResume：示例简历（sampleZh）', () => {
  const data = parseResume(sampleZh)

  it('frontmatter → basics', () => {
    expect(data.basics.name).toBe('张三')
    expect(data.basics.label).toBe('前端开发工程师')
    expect(data.basics.phone).toBe('138xxxx0000')
    expect(data.basics.email).toBe('zhangsan@example.com')
    expect(data.basics.location).toBe('上海')
    expect(data.basics.links).toContainEqual({ label: 'GitHub', url: 'https://github.com/zhangsan' })
  })

  it('> 引言 → basics.summary', () => {
    expect(data.basics.summary).toContain('三年前端开发经验')
  })

  it('区块按约定识别且保持顺序', () => {
    expect(data.sections.map((s) => s.kind)).toEqual(['work', 'education', 'projects', 'skills'])
    expect(data.sections.map((s) => s.title)).toEqual([
      '工作经历',
      '教育经历',
      '项目经历',
      '技能',
    ])
  })

  it('### 条目按 | 切分并识别时间段，bullets 保留行内语法', () => {
    const first = data.sections[0].items[0]
    expect(first.title).toBe('XX科技')
    expect(first.subtitle).toBe('前端开发工程师')
    expect(first.date).toBe('2021.07 - 至今')
    expect(first.bullets).toHaveLength(2)
    expect(first.bullets[1]).toContain('**ne-ui**')
  })

  it('无 ### 的区块（技能）→ 隐式条目承载 bullets', () => {
    const skills = data.sections[3]
    expect(skills.items).toHaveLength(1)
    expect(skills.items[0].title).toBe('')
    expect(skills.items[0].bullets).toHaveLength(2)
  })
})

describe('splitItemHeading：条目标题切分', () => {
  it('三段式（半角 |）', () => {
    expect(splitItemHeading('XX科技 | 前端工程师 | 2021.07 - 至今')).toEqual({
      title: 'XX科技',
      subtitle: '前端工程师',
      date: '2021.07 - 至今',
    })
  })

  it('全角｜与紧凑区间', () => {
    expect(splitItemHeading('XX大学｜计算机 · 本科｜2017.09-2021.06')).toEqual({
      title: 'XX大学',
      subtitle: '计算机 · 本科',
      date: '2017.09-2021.06',
    })
  })

  it('单段 / 副标题含 |', () => {
    expect(splitItemHeading('简历生成器')).toEqual({ title: '简历生成器' })
    expect(splitItemHeading('公司 | A | B | 2020 - 2023')).toEqual({
      title: '公司',
      subtitle: 'A | B',
      date: '2020 - 2023',
    })
  })
})

describe('isDateLike：时间段识别', () => {
  it.each([
    ['2021.07 - 至今', true],
    ['2017.09-2021.06', true],
    ['2020 - 2023', true],
    ['2023.01 – Present', true],
    ['前端开发工程师', false],
    ['XX科技-上海分部', false], // 无年份，不误判
    ['成立于 2020 年', false], // 单个年份无区间，不误判
  ])('%s → %s', (input, expected) => {
    expect(isDateLike(input)).toBe(expected)
  })
})

describe('parseResume：容错策略', () => {
  it('空内容 → 空数据，不抛错', () => {
    expect(parseResume('')).toEqual({ basics: {}, sections: [] })
    expect(parseResume('   \n  ').sections).toEqual([])
  })

  it('非法 frontmatter → 跳过，正文继续', () => {
    const data = parseResume('---\n{[非法\n---\n\n## 工作经历\n### A\n- 内容')
    expect(data.basics.name).toBeUndefined()
    expect(data.sections).toHaveLength(1)
    expect(data.sections[0].items[0].title).toBe('A')
  })

  it('未知区块标题 → custom，标题原样保留', () => {
    const data = parseResume('## 兴趣爱好\n- 摄影')
    expect(data.sections[0].kind).toBe('custom')
    expect(data.sections[0].title).toBe('兴趣爱好')
  })

  it('## 之前的内容 → 「简介」兜底区块，不丢弃', () => {
    const data = parseResume('自我评价正文\n\n- 要点一\n\n## 技能\n- TS')
    expect(data.sections[0].id).not.toBe(data.sections[1].id)
    expect(data.sections[0].paragraphs).toEqual(['自我评价正文'])
    expect(data.sections[0].items[0].bullets).toEqual(['要点一'])
  })

  it('区块内普通段落 → paragraphs 兜底', () => {
    const data = parseResume('## 自我评价\n\n认真负责，抗压能力强。')
    expect(data.sections[0].paragraphs).toEqual(['认真负责，抗压能力强。'])
    expect(data.sections[0].items).toHaveLength(0)
  })

  it('# 标题优先于 frontmatter.name', () => {
    const data = parseResume('---\nname: 旧名\n---\n\n# 新名')
    expect(data.basics.name).toBe('新名')
  })

  it('仅有 frontmatter（无 #）→ 取 frontmatter.name', () => {
    const data = parseResume('---\nname: 张三\n---')
    expect(data.basics.name).toBe('张三')
    expect(data.sections).toHaveLength(0)
  })

  it('连续两个同名区块 → id 去重', () => {
    const data = parseResume('## 项目经历\n### A\n## 项目经历\n### B')
    expect(data.sections[0].id).toBe('projects')
    expect(data.sections[1].id).toBe('projects-2')
  })
})

describe('detectKind：区块类型', () => {
  it.each([
    ['工作经历', 'work'],
    ['实习经历', 'work'],
    ['教育经历', 'education'],
    ['项目经历', 'projects'],
    ['专业技能', 'skills'],
    ['荣誉奖项', 'custom'],
  ])('%s → %s', (title, kind) => {
    expect(detectKind(title)).toBe(kind)
  })
})
