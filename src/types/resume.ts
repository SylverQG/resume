import type { Component } from 'vue'

export interface BasicsLink {
  label: string
  url: string
}

/** 基础信息：来自 frontmatter / `# ` / `> `（设计文档 §3.2） */
export interface Basics {
  name?: string
  label?: string
  phone?: string
  email?: string
  location?: string
  links?: BasicsLink[]
  summary?: string
}

export interface ResumeItem {
  /** 主体：公司 / 学校 / 项目名；为空表示区块级隐式条目（如「技能」） */
  title: string
  subtitle?: string
  date?: string
  /** 行内 markdown 源串，由 RenderInline 渲染 */
  bullets: string[]
}

export type SectionKind = 'work' | 'education' | 'projects' | 'skills' | 'custom'

export interface Section {
  id: string
  title: string
  kind: SectionKind
  items: ResumeItem[]
  /** 区块内自由段落：Markdown 约定之外的内容兜底，不丢弃（§3.1 容错策略） */
  paragraphs: string[]
}

export interface ResumeData {
  basics: Basics
  sections: Section[]
}

/** 一份简历 = 内容 + 外观（多简历管理，§3.4） */
export interface ResumeDoc {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  markdown: string
  templateId: string
  optionsByTemplate: Record<string, StyleOptions>
  customCss: string
  /** 简历照片（本地原始分辨率 dataURL，≤1MB；未上传时模板不预留照片位） */
  photo?: string
  /** 照片显示缩放（1 = 模板默认尺寸） */
  photoScale?: number
}

/** L2 样式面板可调项（§3.6）；映射为 .resume-page 上的 CSS Variables */
export type Density = 'compact' | 'standard' | 'relaxed'

export interface StyleOptions {
  accentColor: string
  fontFamily: 'sans' | 'serif'
  /** 字号档位：0.85 / 1 / 1.15 */
  fontScale: number
  density: Density
  headerLayout: 'center' | 'left'
  /** 区块排序（section.id 列表）；空数组 = 跟随 Markdown 原序 */
  sectionOrder: string[]
  showIcons: boolean
  /** 专业调整：页面上下边距覆盖（mm），缺省跟随密度 */
  padY?: number
  /** 专业调整：页面左右边距覆盖（mm），缺省跟随密度 */
  padX?: number
  /** 专业调整：要点符号覆盖，作用于所有模板 */
  bullets?: 'disc' | 'dash' | 'none'
}

/** 样式方案：模板 + 样式的整体快照，可保存/应用/导入导出（§3.7） */
export interface ThemePreset {
  id: string
  name: string
  templateId: string
  options: StyleOptions
  /** 随方案一起保存的 L3 自定义 CSS（已限定 .resume-page 作用域） */
  customCss?: string
}

export interface TemplateMeta {
  id: string
  name: string
  description: string
  /** 内联 SVG 骨架缩略图（自有静态常量，仅供 v-html 展示） */
  thumbnail: string
  /** 该模板推荐的默认样式；与用户覆盖合并后作为 styleOptions */
  defaults: StyleOptions
  component: Component
}
