# Markdown 转简历 Web 应用 — 项目设计文档

> 版本 v1.0 · 2026-09-15 · 状态：M0–M4 完成 + 多简历管理与内置帮助

**变更记录**

| 版本 | 变更 |
|---|---|
| v0.1 | 初稿 |
| v0.2 | 框架定为 Vue 3 + Vite；新增「无后端能力影响分析」；模板扩为 6+2；新增三层模板自定义体系（样式面板 + 自定义 CSS + 样式方案）；新增中英文国际化设计 |
| v0.3 | 远期目标新增「拖拽式模板设计器」，新增 §8 设计方向（纯前端能力） |
| v0.4 | 确认需要显式「简历长度提示」，新增 §3.6 设计（页数徽标 / 目标页数 / 一键压缩），纳入 M3 |
| v0.5 | M0/M1 落地；§3.2 数据模型补充 `Section.paragraphs`（区块内自由段落兜底，落实「不丢弃」容错策略） |
| v0.6 | M2 落地：6 模板（classic/sidebar/minimal/timeline/banner/compact）+ L2 样式面板 + 样式方案 + localStorage 持久化；store 采用 `optionsByTemplate` 落实「每模板记住主题」 |
| v0.7 | 模板扩至 12 款（新增 serif/twocolumn/cards/raildark/swiss/ledger 六种形态）；打印加 `print-color-adjust: exact` 保证深色背景原样打印 |
| v0.8 | M3 落地：CodeMirror 编辑器（懒加载）、vue-i18n 中英切换 + 英文示例、.md 导入导出、A4 分页线与长度提示（页数徽标 / 目标页数 / 一键压缩 / 撤销）；空状态提示从模板上移至预览层，模板零内置文案 |
| v0.9 | M4 落地：L3 自定义 CSS（`.resume-page` 作用域自动处理，预览/打印一致生效）、样式方案含 CSS 并支持 JSON 导入导出、JSON Resume 双向导入导出；文件操作收拢至「文件」菜单 |
| v1.0 | 多份简历管理（新建/复制/重命名/删除/切换，外观与自定义 CSS 随简历保存，存储迁移 v1→v2，至少保留一份）；应用内「写作约定」帮助抽屉（规则清单 + 可载入/复制的完整示例） |

---

## 1. 项目概述

### 1.1 一句话定位

用 Markdown 书写简历内容，在网页中实时预览多种排版模板并自由定制样式，一键导出 A4 PDF 的**纯前端**工具。默认中文界面，可切换英文。

### 1.2 核心用户流程

1. 打开网页，左侧编辑 Markdown（或一键载入中/英文示例简历）
2. 右侧实时渲染为简历，可切换模板、在样式面板调主题色/字体/间距/区块顺序，高级用户可写自定义 CSS；页数徽标实时提示单页 / 两页
3. 定制结果可保存为「样式方案」，随时切换
4. 点击「导出 PDF」（浏览器打印），得到 A4 排版简历
5. 内容自动保存在浏览器本地，也可导入 / 导出 `.md` 文件

### 1.3 设计原则

- **内容与样式分离**：用户只写 Markdown，排版交给模板与样式方案
- **约定优于配置**：用简单可记的 Markdown 约定描述简历结构，不做表单
- **纯前端优先**：无后端、数据不出浏览器，可静态部署（影响分析见 §2.3）
- **模板可插拔**：新增一个模板 = 新增一个目录，不改动核心代码
- **样式分层可定制**：内置模板 → 可视化样式面板 → 自定义 CSS，逐层开放

---

## 2. 技术选型

### 2.1 总览

| 领域 | 选择 | 备选 | 选择理由 |
|---|---|---|---|
| 构建工具 | Vite | webpack | 启动快、零配置、当前生态标准 |
| 框架 | **Vue 3 + TypeScript**（Composition API + `<script setup>`） | React 18 | 用户更熟悉 Vue，维护成本低；SFC 单文件组件对「模板即组件」表达清晰 |
| 样式 | Tailwind CSS | CSS Modules | 快速产出风格差异明显的多套模板 |
| Markdown 解析 | unified（remark-parse + remark-gfm + remark-frontmatter + yaml） | markdown-it | 我们需要的是 **AST** 而非 HTML 字符串，remark 生态最适合做结构化提取 |
| 行内渲染 | mdast → Vue VNode（`h()` 渲染函数） | v-html + sanitize | 不走 innerHTML，无 XSS 面，直接映射 VNode |
| 编辑器 | CodeMirror 6（`vue-codemirror` 封装） | textarea / Monaco | M1 先用 textarea 验证链路，M3 换 CM6；Monaco 体积过大 |
| 状态管理 | Pinia | Vuex / composable | Vue 官方推荐，TS 推导友好 |
| 本地持久化 | localStorage（防抖自动保存） | IndexedDB | 简历文本量小，localStorage 够用 |
| PDF 导出 | `window.print()` + `@media print` | html2pdf.js / Puppeteer | 零依赖、矢量文字、保真度最高（见决策 2） |
| 国际化 | vue-i18n（v-html 免用，纯插值） | 自写轻量 t() | 标准方案，按需加载语言包 |
| 部署 | Vercel / GitHub Pages | — | 纯静态，无服务器成本 |

### 2.2 关键决策详解

#### 决策 1：渲染架构 —— 结构化数据 + 模板组件（采用方案 B）

| 方案 | 思路 | 优点 | 缺点 |
|---|---|---|---|
| A. CSS 换肤 | md → HTML，模板 = 一套 CSS | 实现最简单 | 只能改颜色字体，做不出「左右双栏 / 时间轴」这种真正的模板差异 |
| **B. 结构化 + 组件（采用）** | md → ResumeData → Vue 模板组件渲染 | 模板自由度最高，布局真正不同；中间数据可复用（远期可导出 JSON Resume） | 多一步解析与约定定义 |
| C. JSON Resume 标准 | md → 标准 schema → 渲染 | 行业标准 | schema 对中文简历场景（学校/专业/籍贯等）表达偏弱，约束多 |

采用 B。方案 C 的 schema 只作为远期「导出格式」选项。

#### 决策 2：PDF 导出 —— 浏览器打印优先

- **`window.print()`（采用）**：输出矢量文字、可复制、可被 ATS 简历解析器读取；零依赖。缺点是依赖打印边距设置，用 `@page { size: A4; margin: 0 }` + 模板自带内边距解决。
- **html2canvas + jsPDF**：截图转位图，文字不可选、易模糊、文件大 —— 不采用。
- **服务端 Puppeteer**：保真最稳、可批量，但引入后端与部署成本 —— 列为远期可选（影响分析见 §2.3）。

#### 决策 3：编辑器分期

M1 用 textarea + 等宽字体即可验证核心链路；M3 换 CodeMirror 6（Markdown 语法高亮、行号、列表自动延续）。Monaco 体积大、面向 IDE 场景，不选。

#### 决策 4：模板自定义深度 —— 样式面板 + 自定义 CSS（三层体系）

「编辑模板的样子、再填数据导出 PDF」按三层实现，逐层开放（详细设计见 §3.7）：

1. **L1 模板选择**：内置 6 个布局迥异的模板，一键切换
2. **L2 可视化样式面板**：主题色 / 字体 / 字号 / 密度 / 头部版式 / 区块顺序，实时生效
3. **L3 自定义 CSS**（高级）：自由覆盖样式，作用域限定在简历画布内

三层组合可保存为「样式方案」（Theme Preset），随时切换、导入导出。

### 2.3 纯前端边界：缺少后端的能力影响分析

| 能力 | 没有后端的影响 | 等级 | 缓解方案 |
|---|---|---|---|
| **云同步 / 多设备** | 简历只存在当前浏览器里，清缓存、换电脑即丢失 | **高** | 自动保存 + 首次使用引导「导出 .md 备份」；导入/导出 `.md` 即手动同步 |
| **服务端 PDF 渲染** | 导出依赖用户浏览器打印；Safari/Firefox 分页边距可能有差异；无法批量生成 | 中 | 打印 CSS 按浏览器兼容矩阵测试；导出指引建议用 Chrome/Edge |
| **在线简历分享链接** | 无法生成一个发给 HR 的网页简历 URL | 中 | 主场景由 PDF 覆盖；远期可做「只读分享页」静态部署（数据编码进 URL） |
| **账号体系** | 无登录，模板偏好 / 样式方案不跨设备 | 低 | 样式方案支持导出 JSON，手动迁移 |
| **AI 润色 / 翻译 / 诊断**（远期） | 纯前端接 LLM 需用户自带 API Key 直连，有泄露风险，无法统一代理 | 中（远期） | 若做，加轻量服务端代理（如 Cloudflare Workers）；MVP 不做 |
| **批量生成 / 开放 API** | 无法批量把 JSON 渲染成 PDF | 低 | 个人工具场景可接受 |

**结论**：以上影响在 MVP 阶段全部可接受，不阻塞纯前端架构。其中「云同步」和「分享链接」是未来最值得用最小后端补齐的两项（Cloudflare Workers + KV 成本近零），列为远期演进方向，本项目的数据模型（ResumeData / 样式方案均为纯 JSON）已为此留好序列化基础。**拖拽式模板设计器**同样列为远期目标——该能力本身是纯前端的，不依赖后端，设计方向见 §8。

---

## 3. 核心设计

### 3.1 Markdown 约定规范（内容协议）

Frontmatter（YAML）承载基础信息，正文标题层级承载区块：

````markdown
---
name: 张三
label: 前端开发工程师
phone: '138xxxx0000'
email: zhangsan@example.com
github: https://github.com/zhangsan
location: 上海
---

# 张三

> 三年前端开发经验，主导过 XX 中台从 0 到 1。

## 工作经历

### XX科技 | 前端开发工程师 | 2021.07 - 至今
- 负责核心控制台性能优化，首屏从 3.2s 降至 1.1s
- 搭建组件库 **ne-ui**，覆盖 40+ 组件

### YY网络 | 前端实习生 | 2020.06 - 2020.09
- 参与营销活动页开发，沉淀 5 套活动模板

## 教育经历

### XX大学 | 计算机科学与技术 · 本科 | 2017.09 - 2021.06
- GPA 3.7/4.0，获国家励志奖学金

## 项目经历

### 简历生成器
- 用 Markdown 书写简历，支持多模板与 PDF 导出
- 技术栈：React / TypeScript / unified

## 技能
- 语言：TypeScript / Python
- 前端：React / Vue / Tailwind / Vite
````

解析规则表：

| Markdown 元素 | 映射 |
|---|---|
| frontmatter | `basics`（姓名 / 联系方式 / 链接） |
| `# ` | 姓名（缺省时取 `frontmatter.name`） |
| `## ` | 区块标题（工作经历 / 教育经历 / …；未知标题 → 自定义区块，按原顺序渲染） |
| `### ` | 条目标题，按 `\|` 切分为 主体 / 副标题 / 时间（最多 3 段，时间段用正则识别） |
| `- ` 列表项 | 条目 bullets，支持 **加粗**、`` `代码` ``、[链接] 等行内语法 |
| `> ` | 个人简介，置于头部下方 |
| 普通段落 | 归入所在区块的自由文本 |

**容错策略**：不符合约定的内容不丢弃、不报错，兜底渲染；解析器是纯函数（md → ResumeData），用 Vitest 做单元测试。

### 3.2 数据模型（`src/types/resume.ts`）

```ts
interface Basics {
  name?: string;
  label?: string;        // 职位/头衔
  phone?: string;
  email?: string;
  location?: string;
  links?: { label: string; url: string }[];  // github / homepage / blog...
  summary?: string;      // > 引言
}

interface ResumeItem {
  title: string;         // 主体：公司 / 学校 / 项目名
  subtitle?: string;     // 职位 / 专业
  date?: string;         // 2021.07 - 至今
  bullets: string[];     // 行内 markdown 源串
}

interface Section {
  id: string;
  title: string;
  kind: 'work' | 'education' | 'projects' | 'skills' | 'custom';
  items: ResumeItem[];   // 无 ### 条目时（如「技能」），bullets 直接作为区块内容
  paragraphs: string[];  // 区块内自由段落：约定外内容兜底渲染，不丢弃
}

interface ResumeData {
  basics: Basics;
  sections: Section[];
}
```

### 3.3 模板系统

**内置 12 个模板**（已全部实现），布局机制各不相同，覆盖主流风格：

| id | 名称 | 布局形态 | 适用 |
|---|---|---|---|
| classic | 经典单栏 | 居中头部、单栏顺排、细分隔线 | 通用投递 |
| sidebar | 双栏侧栏 | 左侧浅色栏（联系/技能），右栏经历 | 互联网、信息密度高 |
| minimal | 极简 | 无色彩装饰、大留白 | 设计 / 咨询 |
| timeline | 时间轴 | 左侧竖向时间线，经历按节点排布 | 强调职业轨迹 |
| banner | 顶栏横幅 | 主题色横幅头部 + 技能标签化 | 现代风格 |
| compact | 紧凑一页 | 小字号、窄边距、高密度 | 内容多要压进一页 |
| serif | 雅致衬线 | 衬线排印、双细线、居中小型大写标题 | 学术 / 外企 |
| twocolumn | 双栏报刊 | 头部通栏 + 正文 CSS 双栏流动 | 信息密度高、页数敏感 |
| cards | 卡片分区 | 首字母头像 + 圆角卡片区块 | 现代产品风 |
| raildark | 深色右栏 | 右侧主题色深栏反白（联系/技能置右） | 强个性版式 |
| swiss | 瑞士栅格 | 粗黑大字头、区块编号、通栏横线 | 排印/设计岗 |
| ledger | 表格左标签 | 左列区块标签 + 右列内容、发丝线分行 | 欧式表格式 |

**接口定义**：

```ts
// src/templates/registry.ts
export interface TemplateMeta {
  id: string;              // 'classic'
  name: string;            // 经典单栏
  thumbnail: string;       // 缩略图（SVG 骨架图即可，无需截图）
  defaults: StyleOptions;  // 该模板推荐的默认样式
  tunables: TunableKey[];  // 该模板暴露哪些可调项（不适用的在面板中隐藏）
}

// 每个模板 = 一个目录：index.vue（布局组件）+ meta.ts（元信息）
```

**预览画布**：固定 A4 宽度（794px @96dpi），按容器高度 `scale` 缩放；模板渲染在 `.resume-page` 内，打印时仅输出该节点（含 `print-color-adjust: exact`，深色头部/侧栏背景原样打印）。

### 3.4 状态与持久化

```
useResumeStore (Pinia)
├── markdown: string                      # 源文本（唯一事实源）
├── templateId: string
├── optionsByTemplate: Record<id, StyleOptions>  # 每模板记住自己的样式覆盖
├── styleOptions (computed)               # 生效样式 = 模板 defaults + 用户覆盖
├── customCss: string                     # L3 自定义 CSS（M4 开放 UI）
├── presets: ThemePreset[]                # 样式方案列表
├── targetPages: 1 | 2                    # 目标页数（长度提示基准）
├── locale: 'zh-CN' | 'en'
└── actions: setMarkdown / setTemplate / setOption / setTargetPages / savePreset / applyPreset / resetStyle ...
```

> v1.0 起文档级状态（markdown / templateId / optionsByTemplate / customCss）归入 `resumes: ResumeDoc[]`，每份简历独立保存内容与外观；store 对外保留同名代理 API，并新增 createResume / duplicateResume / renameResume / deleteResume / switchResume。存储版本 v1 → v2 自动迁移。

```ts
interface StyleOptions {
  accentColor: string;     // 主题色
  fontFamily: 'sans' | 'serif';
  fontScale: number;       // 0.85 / 1 / 1.15
  density: 'compact' | 'standard' | 'relaxed';
  headerLayout: 'center' | 'left';
  sectionOrder: string[];  // 区块排序
  showIcons: boolean;
}

interface ThemePreset {
  id: string;
  name: string;
  templateId: string;
  options: StyleOptions;
  customCss?: string;
}
```

- 派生数据不进 store：`const resumeData = computed(() => parse(markdown))`
- localStorage 防抖 500ms 自动保存 `{ version, markdown, templateId, styleOptions, customCss, presets, targetPages, locale }`，带版本号便于迁移
- 导入 / 导出 `.md` = 浏览器文件读写；样式方案可导出 / 导入 JSON

### 3.5 打印导出细节

- `@page { size: A4; margin: 0 }`，页边距由模板自身控制
- 打印样式：隐藏编辑器与工具栏，`.resume-page` 还原 `scale(1)`
- 跨页规则：条目 `break-inside: avoid`，区块标题 `break-after: avoid`（避免标题孤行）
- 浏览器兼容：以 Chrome/Edge 为基准，Safari/Firefox 做打印回归测试并给出指引

### 3.6 简历长度提示（单页 / 两页）

预览显式标注当前简历将排成几页，帮助用户把内容控制在目标长度内：

- **页数徽标**：预览右上角常驻「共 N 页」，内容增删实时更新；超出目标页数时变警示色
- **目标页数**：Toolbar 可设「目标 1 页 / 目标 2 页」，超出时提示「内容超出 1 页，末尾内容将进入第 2 页」；不足时提示「第 2 页内容偏少，可压缩回 1 页」
- **分页虚线**：画布按 A4 高度（1123px @96dpi）绘制分页线，页数计算与徽标同源：`pages = ceil(contentHeight / pageHeight)`
- **一键压缩**：超出时提供「压缩到 1 页」，按 收紧密度 → 降一档字号 → 收窄页边距 顺序自动尝试，压到一页或到下限为止，可一键撤销
- **实现方式**：预览保持单一连续画布 + 分页线，不做显式多页容器拆分；真实分页由打印引擎按同一套 `break` 规则执行，徽标旁注明「以打印预览为准」
- 状态：store 新增 `targetPages`（见 §3.4），随其他设置持久化

### 3.7 模板自定义体系（三层）

| 层级 | 形态 | 实现方式 |
|---|---|---|
| L1 模板 | 内置 6 个 Vue 布局组件 | `registry.ts` 注册，缩略图弹层选择 |
| L2 样式面板 | Toolbar 侧的可视化面板：颜色选择器、字号/密度档位、头部版式切换、区块拖拽排序 | 所有旋钮映射为 `.resume-page` 上的 **CSS Variables**（`--accent`、`--font-scale`、`--leading` 等），模板只消费变量，改面板即时生效 |
| L3 自定义 CSS | 代码编辑框（CM6 css 模式） | 注入 `<style data-user-css>`；**作用域约定**：选择器以 `.resume-page` 开头才生效（注入时做前缀处理） |

- 样式方案 = `{ templateId, options, customCss }` 整体保存 / 应用 / 导入导出
- 「填数据导出 PDF」即现有链路：数据来自 markdown，样式来自当前方案，导出时打印样式与预览完全一致
- 提供「恢复默认样式」一键重置

### 3.8 国际化（默认中文，可切英文）

```
src/i18n/
├── index.ts        # vue-i18n 实例，locale 持久化到 localStorage
├── zh-CN.ts        # UI 文案 + 模板公共词条（默认）
└── en.ts
```

- **UI 语言**：界面按钮、设置面板、提示文案走 `t()`，默认 `zh-CN`，Toolbar 一键切换并记忆
- **简历内容语言**：由用户写的 Markdown 决定，应用不做翻译；用户写的区块标题（如「工作经历」）永远原样显示
- **模板内置词条**：模板自带的栏目标题（如 sidebar 左栏的「联系方式 / CONTACT」）、图标提示走 i18n 词条，跟随 UI 语言
- **示例简历**：内置中 / 英两份，「载入示例」跟随当前语言
- **字体栈**：模板按语言切换字体栈（中文：PingFang / 微软雅黑 / Noto Sans SC；英文：Inter / Helvetica），避免中英文混排字重失调

---

## 4. 目录结构

```
resume/
├── docs/
│   └── PROJECT.md               # 本文档
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── public/
│   └── favicon.svg
└── src/
    ├── main.ts
    ├── App.vue                  # 布局：Toolbar + Editor + Preview
    ├── types/
    │   └── resume.ts            # ResumeData / TemplateMeta / StyleOptions / ThemePreset
    ├── markdown/
    │   ├── parse.ts             # markdown → ResumeData（纯函数，Vitest 单测）
    │   ├── inline.ts            # 行内 md → Vue VNode（h()）
    │   └── samples/
    │       ├── sample.zh.ts     # 中文示例简历
    │       └── sample.en.ts     # 英文示例简历
    ├── i18n/
    │   ├── index.ts
    │   ├── zh-CN.ts
    │   └── en.ts
    ├── templates/
    │   ├── registry.ts          # 模板注册表（新增模板只需在此登记）
    │   ├── shared/              # 模板间复用的子组件（SectionTitle / BulletList / Icons）
    │   ├── classic/             # index.vue + meta.ts
    │   ├── sidebar/             # index.vue + meta.ts
    │   ├── minimal/             # index.vue + meta.ts
    │   ├── timeline/            # index.vue + meta.ts
    │   ├── banner/              # index.vue + meta.ts
    │   └── compact/             # index.vue + meta.ts
    ├── components/
    │   ├── Toolbar.vue          # 模板切换 / 语言切换 / 导出 / 示例
    │   ├── TemplatePicker.vue   # 缩略图选择弹层
    │   ├── StylePanel.vue       # L2 样式面板（颜色/字体/密度/区块排序）
    │   ├── CssEditor.vue        # L3 自定义 CSS 编辑器
    │   ├── PresetMenu.vue       # 样式方案保存/应用/导入导出
    │   ├── EditorPanel.vue      # textarea → CM6（M3）
    │   └── PreviewPanel.vue     # A4 画布 + 缩放 + 分页提示
    ├── stores/
    │   └── useResumeStore.ts    # Pinia
    └── styles/
        ├── global.css
        └── print.css            # @media print / @page
```

**关键约束**：

- `templates/*` 只允许 import `types`、`markdown/inline` 与 `templates/shared`，不反向依赖 UI 组件 —— 保证模板可独立开发与测试
- 模板组件只消费 CSS Variables 与 props，不硬编码颜色字号 —— 保证 L2 面板对所有模板通用

---

## 5. 里程碑

| 阶段 | 内容 | 交付判据 |
|---|---|---|
| M0 脚手架（0.5 天） | Vite + Vue3 + TS + Pinia + Tailwind 初始化，三栏布局骨架 | 页面可跑 |
| M1 核心链路（1–2 天） | md 约定 + 解析器（含单测），classic 模板，textarea 编辑，实时预览，print 导出 | 修改 md 右侧秒级更新；Chrome 导出 PDF 排版正确 |
| M2 模板 + 样式（2–3 天） | registry，6 个模板，L2 样式面板（CSS Variables），样式方案基础版（保存/应用），localStorage | 六模板一键切换；调色/字号实时生效且方案可存取 |
| M3 体验 + 国际化（2–3 天） | CM6 编辑器，vue-i18n（默认中文/可切英文），中英示例简历，导入/导出 .md，A4 分页线与长度提示（页数徽标 / 目标页数 / 一键压缩，见 §3.6） | 英文界面 + 英文示例全流程可用；页数徽标与打印结果一致；长简历分页预览与打印一致 |
| M4 增强（按需） | L3 自定义 CSS，样式方案导入导出，serif/tags 模板，JSON Resume 导入导出，部署上线 | 自定义 CSS 在预览与打印中一致生效 |
| M5+ 远期 | 拖拽式模板设计器（见 §8）：区块自由编排，自定义模板保存 / 分享 | 用户不写代码搭出「自己的模板」 |

需最小后端的远期演进（见 §2.3）：云同步、在线简历分享页、AI 润色代理。

---

## 6. 风险与对策

| 风险 | 对策 |
|---|---|
| 打印分页把条目切断 | `break-inside` 规则 + 预览分页线；提供「压缩到一页」密度选项 |
| 用户 Markdown 不符合约定 | 宽松解析 + 兜底渲染，不丢弃内容；应用内置约定说明与示例 |
| 浏览器打印默认页边距干扰 | `@page margin: 0` + 模板内边距；首次导出给出一图流指引 |
| 模板间样式互相污染 | 每模板根节点加 `template-{id}` class，主题用 CSS Variables 注入 |
| 用户自定义 CSS 破坏布局/打印 | 作用域限定 `.resume-page` + 「恢复默认」按钮；打印前强制预览确认 |
| 中文排版细节（标点、字重） | 按语言切换 font-family 栈；行高密度档位 |
| 6+ 模板的维护成本 | 模板间共享 `shared/` 子组件；建立模板验收清单（打印分页 / 中英文 / 空内容兜底） |
| 预览分页线与真实打印分页存在细微偏差 | 页数基于固定 A4 高度测量；条目级 break 规则保证不切条目；徽标注明以打印预览为准 |

---

## 7. 已确认决策与遗留问题

**已确认**（2026-09-15）：

1. 框架：Vue 3 + Vite + TS + Pinia
2. 模板自定义深度：L2 样式面板 + L3 自定义 CSS（不做自由布局设计器）
3. 国际化：需要，默认中文，可切英文
4. 无后端的影响可接受，MVP 纯前端，云同步/分享链接列远期
5. 拖拽式模板设计器列为远期目标（M5+，设计方向见 §8）
6. 需要显式的「简历长度提示」（单页/两页），随 M3 分页预览一并实现（§3.6）

**遗留问题**（不阻塞开发，随时可定）：

1. 部署目标：Vercel 还是 GitHub Pages（M4 时定即可）
2. 首批 6 个模板的具体视觉稿（开发 M2 时先出 classic 的视觉，其余对齐）

---

## 8. 远期规划：拖拽式模板设计器（M5+）

### 8.1 目标

用户不写代码、不受内置模板固定布局限制，通过**拖拽区块**自由编排版面，搭建并保存「自己的模板」，之后照常填数据、导出 PDF。它是 L1/L2/L3 三层自定义之上的第四层能力，仅在「高级模式」暴露，不影响普通用户主流程。

### 8.2 核心思路：模板 Schema 化

把「模板」从 Vue 组件升级为**布局 Schema（JSON）+ 统一渲染器**——这是能被拖拽编辑的前提：

```
布局 Schema（JSON）                ResumeData（§3.2）
┌──────────────────────┐
│ page                 │            ┌──────────────┐
│ ├─ header（姓名/头衔） │  ────────▶ │ basics       │
│ ├─ aside（侧栏）      │   统一渲染器 │ sections[]   │
│ │   ├─ contact       │            └──────────────┘
│ │   └─ skills        │
│ └─ main（主栏）       │
│     ├─ work          │
│     └─ education     │
└──────────────────────┘
```

- **区块（Block）是最小编排单元**：`header / contact / summary / section / item / 自由文本`，每个区块声明自己消费 ResumeData 的哪一部分
- **渲染器**递归渲染 Schema，区块内部复用 `templates/shared/` 组件——这是 M2 就定下的约束（模板只消费共享区块组件）的自然延伸，也是 Schema 化成本低的原因
- **内置 6 模板逐步重构为 Schema 预设**：classic / sidebar / … = 一份 Schema + 默认样式；用户在预设上「另存为自己的模板」再拖拽修改，起步体验好
- **打印兼容**：画布用 A4 网格（12 栏），区块吸附网格，保证任意拼装都满足 §3.5 的分页规则

### 8.3 交互形态

| 区域 | 内容 |
|---|---|
| 左侧 | 区块仓库（可拖入画布的新区块）+ 图层树 |
| 中间 | A4 画布：拖拽排序、跨区移动（主栏 ↔ 侧栏）、拖边缘调分栏比例 |
| 右侧 | 属性面板：复用 L2 样式面板旋钮 + 区块级样式覆写 |
| 顶部 | 另存为模板 / 应用模板 / 导入导出 JSON / 分享 |

### 8.4 技术选型候选

| 领域 | 候选 | 说明 |
|---|---|---|
| 拖拽 | Sortable.js / vue-draggable-plus | Vue 生态成熟方案，原生支持跨容器移动 |
| Schema 校验 | Zod | 自定义模板导入时的结构校验与兜底 |
| 撤销重做 | 自研 command 栈（Schema 不可变更新） | Schema 是纯 JSON，快照式 undo 简单可靠 |

### 8.5 分期与前置条件

| 阶段 | 内容 | 前置条件 |
|---|---|---|
| M5a | 区块级拖拽：区块跨主栏/侧栏移动、分栏比例调整 | 内置模板完成 Schema 化重构 |
| M5b | 完整设计器：区块仓库、属性覆写、自定义模板的保存与管理 | M5a |
| M5c | 自定义模板导入导出与分享（JSON / URL） | M5b；URL 分享可复用远期「分享页」的后端 |

**主要风险**：自由布局与打印分页的冲突是最大不确定性——用网格吸附 + 实时分页预览约束；设计器入口收在高级模式，做坏了也不拖累核心体验。
