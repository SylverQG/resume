# MD Resume — Markdown 转简历

用 Markdown 书写简历，在浏览器中实时预览 12 款排版模板、自由定制样式，一键导出 A4 PDF。**纯前端应用，无后端、数据不出浏览器。**

## 功能特性

- **写作即排版**：左侧写 Markdown，右侧 A4 画布实时渲染；内容与样式完全分离
- **12 款模板**：布局机制各不相同（单栏 / 双栏 / 时间轴 / 横幅 / 报刊双栏 / 卡片 / 瑞士栅格 / 表格式…），不是换色皮肤
- **三层样式自定义**：内置模板 → 可视化样式面板（主题色 / 字体 / 字号 / 密度 / 区块排序）→ 自定义 CSS（自动限定作用域，预览与导出一致）
- **样式方案**：整套外观保存为方案随时切换，支持 JSON 导入导出
- **多份简历管理**：新建 / 复制 / 重命名 / 删除 / 切换，内容与外观随简历各自保存（如「中文版」「投 A 公司版」）
- **简历照片**：样式面板上传（原图本地存储），12 个模板均设计照片位——头版居中/左对齐时位于头部右侧空白处，矩形呈现，未上传时自动收起
- **纸质友好**：联系方式一律渲染为纯文本（如 `github.com/zhangsan`、`微信 zhangsan_123`），不生成超链接
- **长度提示**：页数徽标 + 目标页数（1 页 / 2 页）+ 超页提示 + 一键压缩（可撤销）
- **多格式导入导出**：Markdown、JSON Resume 双向转换、浏览器打印导出 PDF（矢量文字，可被 ATS 解析）
- **中英双语**：默认中文，一键切换英文；示例简历跟随语言
- **本地自动保存**：localStorage 防抖持久化，刷新不丢；版本化存储，升级自动迁移

## 快速开始

要求 Node.js ≥ 20.19。

```bash
npm install
npm run dev      # 开发（http://localhost:5173）
npm run test     # Vitest 单元测试（60+）
npm run build    # 类型检查 + 构建
npm run preview  # 预览构建产物
```

## Markdown 写作约定

frontmatter（YAML）放基础信息，正文标题层级承载结构：

```markdown
---
name: 张三
label: 前端开发工程师
phone: '138xxxx0000'
email: zhangsan@example.com
github: https://github.com/zhangsan
wechat: 'zhangsan_123'
location: 上海
---

# 张三

> 三年前端开发经验，主导过 XX 中台从 0 到 1。

## 工作经历

### XX科技 | 前端开发工程师 | 2021.07 - 至今
- 负责核心控制台性能优化，首屏从 3.2s 降至 1.1s
- 搭建组件库 **ne-ui**，覆盖 40+ 组件

## 教育经历

### XX大学 | 计算机科学与技术 · 本科 | 2017.09 - 2021.06
- GPA 3.7/4.0

## 技能
- 前端：Vue / React / Tailwind / Vite
- 语言：TypeScript / Python
```

| 语法 | 含义 |
|---|---|
| frontmatter | 姓名 / 头衔 / 联系方式；社交账号支持 github、linkedin、微信（wechat）、QQ（qq）、微博（weibo）、小红书（xiaohongshu）、twitter、instagram、facebook、telegram、homepage、blog |
| `# ` | 姓名（缺省时取 frontmatter.name） |
| `> ` | 个人简介，置于头部下方 |
| `## ` | 区块标题（工作经历 / 教育经历 / 项目经历 / 技能…未识别的按自定义区块渲染） |
| `### A \| B \| C` | 条目：主体 / 副标题 / 时间（按 `\|` 切分，时间段自动识别） |
| `- ` | 要点，支持 `**加粗**`、`` `代码` ``、`[链接](url)` 行内语法 |

容错原则：不符合约定的内容**不会丢弃**，按普通文本兜底渲染。应用内「？」按钮可随时查看完整约定并载入示例。

## 导出 PDF

点击「导出 PDF」调起浏览器打印：

1. 目标选择「另存为 PDF」
2. 勾选「背景图形」（深色头部 / 侧栏模板必需）
3. 建议使用 Chrome / Edge，导出为矢量文字、可复制、可被 ATS 简历系统解析

## 模板一览

| 模板 | 形态 | 适用 |
|---|---|---|
| 经典单栏 classic | 居中头部、单栏顺排 | 通用投递 |
| 双栏侧栏 sidebar | 左侧浅色栏（联系/技能） | 互联网、信息密度高 |
| 极简 minimal | 无装饰、大留白 | 设计 / 咨询 |
| 时间轴 timeline | 竖向时间线 | 强调职业轨迹 |
| 顶栏横幅 banner | 主题色横幅 + 技能标签 | 现代风格 |
| 紧凑一页 compact | 小字号高密度 | 内容多压一页 |
| 雅致衬线 serif | 衬线排印、双细线 | 学术 / 外企 |
| 双栏报刊 twocolumn | 正文双栏流动 | 页数敏感 |
| 卡片分区 cards | 首字母头像 + 卡片区块 | 现代产品风 |
| 深色右栏 raildark | 右侧深栏反白 | 强个性版式 |
| 瑞士栅格 swiss | 粗黑字头、区块编号 | 排印 / 设计岗 |
| 表格左标签 ledger | 左标签右内容、发丝线 | 欧式表格式 |

## 技术栈

Vue 3 + TypeScript + Vite + Pinia + Tailwind CSS v4 + vue-i18n + CodeMirror 6 + unified（remark）

## 部署

纯前端静态站点，构建产物为 `dist/`。

### GitHub Pages（已配好自动部署）

1. 在 GitHub 新建仓库，进入 **Settings → Pages → Build and deployment**，Source 选择 **GitHub Actions**
2. 关联远程并推送：
   ```bash
   git remote add origin git@github.com:<用户名>/<仓库名>.git
   git push -u origin main
   ```
3. 之后每次推送 `main` 自动跑测试 → 构建 → 部署，访问地址为 `https://<用户名>.github.io/<仓库名>/`

子路径 base 由工作流自动取仓库名，无需改配置。本地验证 Pages 形态：

```bash
npm run build -- --base=/<仓库名>/
npm run preview -- --base=/<仓库名>/
```

> Windows Git Bash 注意：前导 `/` 的参数会被 MSYS 转成本地路径，需加前缀 `MSYS_NO_PATHCONV=1`（GitHub Actions 在 Linux 上运行，不受影响）。

### Vercel

导入仓库即可，自动识别 Vite 项目（根路径部署，无需 base）。

## 项目结构

```
src/
├── types/          # ResumeData / ResumeDoc / StyleOptions 等数据模型
├── markdown/       # 解析器（md → ResumeData）、行内渲染、JSON Resume 映射、示例
├── templates/      # 12 款模板（每款 index.vue + meta.ts）+ 注册表 + 共享工具
├── components/     # 编辑器 / 预览 / 工具栏 / 模板选择 / 样式面板 / CSS 编辑器…
├── stores/         # Pinia：多简历 + 样式方案 + 持久化（localStorage）
├── i18n/           # 中 / 英语言包（默认中文）
└── styles/         # 全局样式 + 打印样式（@page A4）
docs/PROJECT.md     # 设计文档：架构决策、内容协议、里程碑、远期规划
```

关键约束：`templates/*` 只消费数据模型与 CSS Variables，不反向依赖 UI —— 新增模板 = 新增一个目录 + 注册表登记一行。

## Roadmap

- [ ] M5：拖拽式模板设计器（模板 Schema 化 → 区块自由编排 → 自定义模板分享）
- [ ] 云同步 / 多设备（需最小后端）
- [ ] 在线简历分享页（需最小后端）
- [ ] AI 润色 / 翻译（需服务端代理）

完整设计见 [docs/PROJECT.md](docs/PROJECT.md)。
