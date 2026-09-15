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

纯前端静态站点，构建产物为 `dist/`。

### GitHub Pages（已配好自动部署）

1. 在 GitHub 新建仓库（如 `resume`），进入 **Settings → Pages → Build and deployment**，Source 选择 **GitHub Actions**
2. 关联远程并推送：
   ```bash
   git remote add origin git@github.com:<用户名>/<仓库名>.git
   git push -u origin main
   ```
3. 之后每次推送 `main` 自动跑测试 → 构建 → 部署，访问地址为 `https://<用户名>.github.io/<仓库名>/`

子路径 base 由工作流自动取仓库名（`--base=/<仓库名>/`），无需改配置。本地想验证 Pages 形态时：

```bash
npm run build -- --base=/<仓库名>/
npm run preview -- --base=/<仓库名>/
```

> Windows Git Bash 注意：前导 `/` 的参数会被 MSYS 转成本地路径，需加前缀 `MSYS_NO_PATHCONV=1`（GitHub Actions 在 Linux 上运行，不受影响）。

### Vercel

导入仓库即可，自动识别 Vite 项目（根路径部署，无需 base）。

## 里程碑

M0 脚手架 → M1 核心链路（解析 + classic 模板 + 导出）→ M2 模板系统 + 样式面板 → M3 体验 + 国际化 → M4 增强 → M5+ 拖拽模板设计器（远期）
