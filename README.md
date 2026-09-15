# resume — Markdown 转简历

用 Markdown 书写简历，在网页中实时预览多种模板并导出 A4 PDF 的纯前端工具。设计文档见 [docs/PROJECT.md](docs/PROJECT.md)。

## 技术栈

Vue 3 + TypeScript + Vite + Pinia + Tailwind CSS v4（vue-i18n 于 M3 接入）

## 快速开始

```bash
npm install
npm run dev      # 开发（http://localhost:5173）
npm run build    # 类型检查 + 构建
npm run test     # Vitest 单元测试
npm run preview  # 预览构建产物
```

## 部署

纯前端静态站点，构建产物为 `dist/`：

- **Vercel**：导入仓库即可，自动识别 Vite 项目
- **GitHub Pages / 任意静态托管**：`npm run build` 后发布 `dist/`；部署到子路径（如 `user.github.io/resume`）时需在 `vite.config.ts` 设置 `base: '/resume/'`

## 里程碑

M0 脚手架 → M1 核心链路（解析 + classic 模板 + 导出）→ M2 模板系统 + 样式面板 → M3 体验 + 国际化 → M4 增强 → M5+ 拖拽模板设计器（远期）
