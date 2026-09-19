import { describe, expect, it } from 'vitest'

import {
  defaultSchema,
  normalizeSchema,
  unwrapSchemaFile,
  wrapSchemaFile,
} from './schema'

describe('normalizeSchema：任意输入 → 合法 Schema', () => {
  it('合法输入完整保留', () => {
    const schema = defaultSchema()
    schema.id = 'custom-x'
    schema.name = '我的模板'
    schema.colors.accent = '#ff0000'
    schema.body.columns = 2
    const out = normalizeSchema(structuredClone(schema))
    expect(out).toEqual(schema)
  })

  it('空对象 → 全默认值（无 id 时返回 null）', () => {
    expect(normalizeSchema({})).toBeNull()
    const out = normalizeSchema({}, 'custom-1')
    expect(out?.id).toBe('custom-1')
    expect(out?.colors.accent).toBe('#1d4ed8')
    expect(out?.body.columns).toBe(1)
  })

  it('非法枚举值回退默认，字段类型错误兜底', () => {
    const out = normalizeSchema({
      id: 'x',
      page: { padY: 'not-a-number', padX: 20 },
      font: { family: 'comic-sans', scale: 'big' },
      section: { titleStyle: 42, order: ['work', 7, 'skills'], hidden: 'work', showIcons: 'yes' },
    })
    expect(out?.page.padY).toBe(13)
    expect(out?.page.padX).toBe(20)
    expect(out?.font.family).toBe('sans')
    expect(out?.font.scale).toBe(1)
    expect(out?.section.titleStyle).toBe('underline')
    expect(out?.section.order).toEqual(['work', 'skills'])
    expect(out?.section.hidden).toEqual([])
    expect(out?.section.showIcons).toBe(true)
  })

  it('null / 非对象返回 null，不抛错', () => {
    expect(normalizeSchema(null)).toBeNull()
    expect(normalizeSchema('x')).toBeNull()
  })
})

describe('Schema 文件包装 / 解包', () => {
  it('wrap → unwrap 往返一致', () => {
    const schema = defaultSchema()
    schema.id = 'custom-a'
    const file = wrapSchemaFile(schema)
    expect(file.type).toBe('resume-template-schema')
    expect(unwrapSchemaFile(file)).toEqual(schema)
  })

  it('裸 schema（无包装）也能解出', () => {
    const schema = defaultSchema()
    schema.id = 'custom-b'
    expect(unwrapSchemaFile({ ...schema })).toEqual(schema)
  })

  it('无效文件返回 null', () => {
    expect(unwrapSchemaFile({ type: 'resume-template-schema', version: 1 })).toBeNull()
    expect(unwrapSchemaFile('nope')).toBeNull()
  })
})
