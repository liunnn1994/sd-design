// 该模块仅被 use-pdf-js.ts 动态 import，使打包进组件库的 pdf.js worker 只在 PDF 预览时按需加载，
// 避免影响图片/视频预览的初始体积。
//
// vite 在 lib 构建下会把 `new URL(asset, import.meta.url)` 内联为 base64 data URL；
// pdf.js 会用同源 blob 包装该 data URL 创建 Worker，因此内网/离线环境可直接使用（无需 CDN）。
// 如需改用 CDN 或自托管，通过 pdfProps.workerSrc 覆盖即可。
export default new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).href;
