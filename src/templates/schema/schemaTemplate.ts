import { defineComponent, h } from 'vue'

import type { ResumeData, StyleOptions, TemplateMeta } from '@/types/resume'
import type { TemplateSchema } from '@/types/schema'

import SchemaRenderer from './SchemaRenderer.vue'

/** 自定义 Schema 模板的缩略图：按 schema 生成简易骨架图 */
export function schemaThumbnail(schema: TemplateSchema): string {
  const a = schema.colors.accent
  const headerH = schema.header.show ? 16 : 0
  const bars = (x: number, w: number, y0: number, n: number) =>
    Array.from({ length: n }, (_, i) => `<rect x="${x}" y="${y0 + i * 7}" width="${w}" height="2.5" rx="1" fill="#cbd5e1"/>`).join('')

  const headerSvg = schema.header.show
    ? `<rect x="8" y="8" width="${schema.header.bg !== 'none' ? 104 : 34}" height="10" rx="2" fill="${schema.header.bg !== 'none' ? a : a}"/>` +
      `<rect x="${schema.header.bg !== 'none' ? 8 : 8}" y="${8 + headerH - 4}" width="52" height="2" rx="1" fill="#94a3b8"/>`
    : ''
  const oneCol = `<rect x="8" y="${8 + headerH + 6}" width="30" height="3" rx="1.5" fill="${a}"/>` + bars(8, 60, 8 + headerH + 14, 4)
  const twoCols = `<rect x="8" y="${8 + headerH + 6}" width="26" height="3" rx="1.5" fill="${a}"/>` +
    bars(8, 46, 8 + headerH + 14, 4) +
    `<rect x="62" y="${8 + headerH + 6}" width="26" height="3" rx="1.5" fill="${a}"/>` +
    bars(62, 46, 8 + headerH + 14, 4)
  const body = schema.body.columns === 2 ? twoCols : oneCol

  return `<svg viewBox="0 0 120 90" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="90" fill="#fff"/>${headerSvg}${body}</svg>`
}

/** Schema → 动态模板组件（供模板列表与预览使用） */
export function schemaToMeta(schema: TemplateSchema): TemplateMeta {
  return {
    id: schema.id,
    name: schema.name,
    description: '自定义模板',
    thumbnail: schemaThumbnail(schema),
    defaults: {
      accentColor: schema.colors.accent,
      fontFamily: schema.font.family,
      fontScale: schema.font.scale,
      density: 'standard',
      headerLayout: schema.header.layout,
      sectionOrder: schema.section.order,
      showIcons: schema.section.showIcons,
    },
    component: defineComponent({
      name: `SchemaTemplate-${schema.id}`,
      props: {
        data: { type: Object, required: true },
        options: { type: Object, required: false },
        photo: { type: String, required: false },
      },
      setup(innerProps) {
        return () =>
          h(SchemaRenderer, {
            schema,
            data: innerProps.data as ResumeData,
            options: innerProps.options as StyleOptions | undefined,
            photo: innerProps.photo as string | undefined,
          })
      },
    }),
  }
}
