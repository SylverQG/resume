import { describe, expect, it } from 'vitest'

import { sampleZh } from './samples/sample.zh'
import { fromJsonResume, toJsonResume } from './jsonresume'
import { parseResume } from './parse'

describe('toJsonResume', () => {
  const jr = toJsonResume(parseResume(sampleZh)) as Record<string, any>

  it('basics 映射', () => {
    expect(jr.basics.name).toBe('张三')
    expect(jr.basics.label).toBe('前端开发工程师')
    expect(jr.basics.location).toEqual({ region: '上海' })
    expect(jr.basics.profiles).toContainEqual({ network: 'GitHub', url: 'https://github.com/zhangsan' })
  })

  it('work 条目含日期切分与要点', () => {
    const first = jr.work[0]
    expect(first.name).toBe('XX科技')
    expect(first.position).toBe('前端开发工程师')
    expect(first.startDate).toBe('2021.07')
    expect(first.endDate).toBe('至今')
    expect(first.highlights).toHaveLength(2)
  })

  it('skills 由区块 bullets 展平', () => {
    expect(jr.skills).toHaveLength(2)
    expect(jr.skills[0].name).toContain('TypeScript')
  })
})

describe('fromJsonResume → parseResume 往返', () => {
  const source = parseResume(sampleZh)
  const markdown = fromJsonResume(toJsonResume(source), 'zh-CN')
  const back = parseResume(markdown)

  it('basics 往返一致', () => {
    expect(back.basics.name).toBe('张三')
    expect(back.basics.email).toBe('zhangsan@example.com')
    expect(back.basics.links).toContainEqual({ label: 'GitHub', url: 'https://github.com/zhangsan' })
  })

  it('区块往返一致', () => {
    expect(back.sections.map((s) => s.kind)).toEqual(['work', 'education', 'projects', 'skills'])
    expect(back.sections[0].items[0].title).toBe('XX科技')
    expect(back.sections[0].items[0].date).toBe('2021.07 - 至今')
    expect(back.sections[3].items[0].bullets).toHaveLength(2)
  })

  it('英文 locale 生成英文区块标题', () => {
    const md = fromJsonResume(toJsonResume(source), 'en')
    expect(md).toContain('## Work Experience')
  })

  it('空/非法输入不抛错', () => {
    expect(fromJsonResume(null, 'zh-CN')).toBe('\n')
    expect(fromJsonResume('oops', 'zh-CN')).toBe('\n')
  })
})
