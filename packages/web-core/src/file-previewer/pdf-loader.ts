import type { PdfJsModule } from './pdf.js';
import type { FilePreviewerPdfProps } from './types.js';

// pdf.js is large, so it is lazily imported on first use and shared across instances.
let pdfModulePromise: Promise<PdfJsModule> | undefined;
export function loadPdfModule(): Promise<PdfJsModule> {
  if (!pdfModulePromise) pdfModulePromise = import('pdfjs-dist');
  return pdfModulePromise;
}

// Loads the worker module so it assigns globalThis.pdfjsWorker, enabling pdf.js
// main-thread (fake worker) rendering. Used when `worker: false` or when no worker
// URL can be resolved.
let mainThreadWorkerPromise: Promise<void> | undefined;
function ensureMainThreadWorker(): Promise<void> {
  if (!mainThreadWorkerPromise) {
    mainThreadWorkerPromise = import('pdfjs-dist/build/pdf.worker.min.mjs').then(() => undefined);
  }
  return mainThreadWorkerPromise;
}

// 默认走 Worker：pdf.js worker 已打包进组件库，默认从本库引入（适用于内网/离线）。
// 通过独立模块的动态 import，使内联的 worker data URL 仅在 PDF 预览时按需加载。
// 如需改用 CDN 或自托管，通过 pdfProps.workerSrc 覆盖即可。
export async function resolvePdfWorker(
  props: FilePreviewerPdfProps,
  defaultWorkerSrc: () => Promise<string>,
): Promise<string | undefined> {
  // GlobalWorkerOptions 是全局单例；按优先级配置：显式关闭 > workerPort > workerSrc > 默认打包 Worker。
  if (props.worker === false) {
    await ensureMainThreadWorker();
    return;
  }
  if (props.workerPort) {
    return;
  }
  if (props.workerSrc) {
    return props.workerSrc;
  }
  return defaultWorkerSrc();
}
