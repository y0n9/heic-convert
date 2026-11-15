# heicconvert

<p align="center">
  <a href="./README.md">English</a> · 简体中文
</p>

> Free, private HEIC to JPG / PNG / WebP conversion, entirely in your browser.

heicconvert 是一个纯前端的 HEIC/HEIF 图片转换工具站：首页就是转换器，选择或拖入照片后自动开始转换，输出 JPG、PNG 或 WebP，可单张下载，也可打包成 ZIP。

转换全程在浏览器本地完成——没有后端、没有上传接口、没有账号、没有水印。站点界面为英文，本文件为中文项目文档。

## 功能特性

- **三种输出格式**：JPG（可调质量）、PNG（无损）、WebP（可调质量），不支持其他格式。
- **批量转换**：支持 `.heic` / `.heif`、拖拽或文件选择，上传后按顺序自动转换，并显示整体进度百分比与当前文件名。
- **质量设置**：JPG / WebP 为 10%–100%，默认 90%；PNG 隐藏质量滑块。已转换后修改格式或质量会提示重新转换。
- **多图容器**：HEIC 内含多张图片时，分别导出为带数字后缀的独立文件。
- **下载**：逐张下载，或用 JSZip 打包为 `heic-to-<format>-photos.zip`，自动处理重名文件。
- **结果信息**：预览图、输出尺寸、输出大小与输出文件名。
- **容错**：整批格式校验、单文件失败原因提示与重试、移除单张 / 清空列表、超过 50 MB 时提示设备内存风险（只提示，不硬性拒收）。
- **隐私**：不上传图片、不注入水印；关闭标签页即清空当前工作区。
- **SEO 内容页**：iPhone 设置、HEIC vs JPG、Windows 打开方式、Mac 转换方式四篇指南，路由级 title / description。
- **响应式**：桌面与移动端同一套浅米白 / 深绿视觉体系。

## 技术栈

| 类别      | 选型                                                     |
| ------- | ------------------------------------------------------ |
| 框架      | React 19 + TypeScript 5.9                              |
| 构建      | Vite 7（`base: '/'`）、ESLint 9                           |
| 样式      | Tailwind CSS 3 + 手写 CSS（`src/App.css`、`src/index.css`） |
| 路由      | react-router-dom 7（`BrowserRouter`）                    |
| 图标      | lucide-react                                           |
| HEIC 解码 | heic2any 0.0.4（按需动态 import）                            |
| ZIP     | jszip 3（按需动态 import）                                   |

项目由 modern-web-app 模板初始化，`package.json` 中仍保留一批模板自带的 shadcn/ui、Radix UI 依赖；核心运行只依赖上表中的少数几项。

## 本地开发

需要 Node.js **20.19+ 或 22.12+**（Vite 7 要求；本项目在 `v22.22.2` / npm `10.9.7` 下验证）。

```bash
npm ci                # 或 npm install
npm run dev           # 启动开发服务器，默认 http://localhost:5173
npm run lint          # ESLint 检查
npm run build         # tsc -b + vite build，产物在 dist/
npm run preview       # 本地预览生产构建
```

## 目录结构

```text
.
├── index.html                    # 静态兜底 title / description / favicon
├── public/_redirects             # SPA 回退：/* /index.html 200
├── PRD_HEIC_to_JPG_2026-11-08.md # 产品需求与当日迭代记录
├── src/
│   ├── App.tsx                   # 路由、工具页内容、FAQ
│   ├── App.css / index.css       # 全站样式
│   ├── main.tsx                  # 入口
│   ├── heic2any.d.ts             # 解码库类型声明
│   ├── lib/formats.ts            # 输出格式类型与显示名（共享常量）
│   └── components/
│       ├── Converter.tsx         # 转换状态机、上传、转换、下载、ZIP
│       ├── SiteLayout.tsx        # 品牌字标、导航、页脚、动态版权年份
│       ├── GuidePages.tsx        # 四篇指南与相关阅读
│       ├── Seo.tsx               # 按路由更新 title / meta
│       └── FaqList.tsx
└── vite.config.ts
```

## 页面与路由

| 路径                             | 内容                                                | 默认格式 |
| ------------------------------ | ------------------------------------------------- | ---- |
| `/`                            | HEIC to JPG 转换器（首页）                               | JPG  |
| `/heic-to-png`                 | HEIC to PNG 转换器                                   | PNG  |
| `/heic-to-webp`                | HEIC to WebP 转换器                                  | WebP |
| `/iphone-heic-to-jpg`          | iPhone HEIC 设置与转换指南                               | —    |
| `/heic-vs-jpg`                 | HEIC 与 JPG 对比                                     | —    |
| `/how-to-open-heic-on-windows` | Windows 打开 HEIC                                   | —    |
| `/how-to-convert-heic-on-mac`  | Mac 转换 HEIC（浏览器 / Preview / Finder Quick Actions） | —    |

未匹配的路径重定向回首页。

## 转换实现要点

- `heic2any` 与 `jszip` 都是动态 import，首屏不加载解码器与打包库。
- 解码使用 `multiple: true`，因此一个 HEIC 容器里的多张图片会生成多条输出记录。
- **WebP 不能直接交给 `heic2any`**：它只接受 `image/png`、`image/jpeg`、`image/gif`，传入 `image/webp` 会被静默降级成 PNG。本项目先用 `toType: "image/png"` 解码为中间图，再通过 `createImageBitmap` + `canvas.toBlob(..., "image/webp", quality)` 重编码，并用 canvas 能力检测提前给出可读错误。修改这段逻辑时务必保留该两阶段流程。
- 输出通过 `URL.createObjectURL` 生成预览与下载链接，移除文件、清空列表或组件卸载时会 `revokeObjectURL` 释放。
- footer 版权年份运行时取当年，并在标签页重新可见 / 窗口获得焦点时同步，跨年不刷新也能更新。

## 部署

构建产物为静态文件，适合 Cloudflare Pages、Netlify 等静态托管：

```text
Build command:      npm run build
Output directory:   dist
Node version:       22
```

`public/_redirects` 内容为 `/* /index.html 200`，用于保证直接访问 `/heic-to-webp` 这类子路由时能回退到 SPA 入口。

如果部署到 **GitHub Pages**，`_redirects` 不会生效：需要自行提供 `404.html` 回退，或改用 HashRouter；若部署在 `https://<user>.github.io/<repo>/` 子路径下，还需同步修改 `vite.config.ts` 的 `base` 与 `BrowserRouter` 的 `basename`。

## 已验证

- `npm run lint`、`npm run build` 通过。
- 使用 heic2any 官方 demo 样张 `1.heic`（41,389 字节，容器头 `ftypmif1`）完成端到端实测：JPG 输出标准 JPEG/JFIF 头、PNG 输出 `89504e47`、WebP 输出 `RIFF....WEBP`；尺寸 1440×960；单张下载与 ZIP 文件内容名正确；双文件批量 WebP 的 ZIP 通过。
- 格式切换后重新转换、PNG 隐藏质量滑块、无效 HEIC 的失败提示与重试均通过；转换流程无外部 fetch / XHR，页面样式不加载外部字体或脚本。

 
