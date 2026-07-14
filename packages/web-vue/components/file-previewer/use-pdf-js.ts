import type {
  PDFDocumentLoadingTask,
  PDFDocumentProxy,
  PDFPageProxy,
  RenderTask,
} from 'pdfjs-dist';

import type { ShallowRef } from 'vue';
import { shallowRef } from 'vue';

import type { FilePreviewerPdfProps, FilePreviewerStatus } from './types';

import { isServerRendering } from '../_utils/dom';

type PdfJsModule = typeof import('pdfjs-dist');

export interface UsePdfJsContext {
  src: () => string;
  pdfProps: () => FilePreviewerPdfProps | undefined;
  onStatus: (status: FilePreviewerStatus) => void;
}

export interface UsePdfJsReturn {
  doc: ShallowRef<PDFDocumentProxy | null>;
  numPages: ShallowRef<number>;
  page: ShallowRef<number>;
  goto: (page: number) => void;
  prev: () => void;
  next: () => void;
  render: (canvas: HTMLCanvasElement, page?: number) => Promise<void>;
  load: () => Promise<void>;
  destroy: () => Promise<void>;
}

// pdf.js is large, so it is lazily imported on first use and shared across instances.
let pdfModulePromise: Promise<PdfJsModule> | undefined;
function loadPdfModule(): Promise<PdfJsModule> {
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
let bundledWorkerSrcPromise: Promise<string> | undefined;
function defaultWorkerSrc(): Promise<string> {
  if (!bundledWorkerSrcPromise) {
    bundledWorkerSrcPromise = import('./pdfjs-worker-url').then((module) => module.default);
  }
  return bundledWorkerSrcPromise;
}

async function resolveWorker(props: FilePreviewerPdfProps, pdfjs: PdfJsModule): Promise<void> {
  // GlobalWorkerOptions 是全局单例；按优先级配置：显式关闭 > workerPort > workerSrc > 默认打包 Worker。
  if (props.worker === false) {
    await ensureMainThreadWorker();
    return;
  }
  if (props.workerPort) {
    pdfjs.GlobalWorkerOptions.workerPort = props.workerPort;
    return;
  }
  if (props.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = props.workerSrc;
    return;
  }
  pdfjs.GlobalWorkerOptions.workerSrc = await defaultWorkerSrc();
}

function isCancelledError(error: unknown): boolean {
  return (
    error !== null &&
    typeof error === 'object' &&
    'name' in error &&
    (error as { name: unknown }).name === 'RenderingCancelledException'
  );
}

/**
 * @zh 管理 pdf.js 文档加载、分页与画布渲染的生命周期，内部按请求 id 防竞态。
 * @en Manages the pdf.js document loading, pagination and canvas rendering lifecycle, with internal request-id based race protection.
 */
export function usePdfJs(context: UsePdfJsContext): UsePdfJsReturn {
  const doc = shallowRef<PDFDocumentProxy | null>(null);
  const numPages = shallowRef(0);
  const page = shallowRef(1);

  let loadingTask: PDFDocumentLoadingTask | null = null;
  let renderTask: RenderTask | null = null;
  let activePage: PDFPageProxy | null = null;
  let loadId = 0;

  async function load(): Promise<void> {
    const url = context.src();
    if (!url || isServerRendering) return;

    const currentId = ++loadId;
    context.onStatus('loading');
    try {
      const pdfjs = await loadPdfModule();
      if (currentId !== loadId) return;

      const props = context.pdfProps() ?? {};
      await resolveWorker(props, pdfjs);

      await destroy();
      if (currentId !== loadId) return;

      loadingTask = pdfjs.getDocument({ url, ...props.documentParams });
      const pdfDoc = await loadingTask.promise;
      if (currentId !== loadId) {
        // A newer load started; the previous loadingTask was already destroyed by it.
        loadingTask = null;
        return;
      }

      doc.value = pdfDoc;
      numPages.value = pdfDoc.numPages;
      page.value = Math.min(Math.max(props.page ?? 1, 1), pdfDoc.numPages);
      context.onStatus('loaded');
      props.onDocumentLoad?.(pdfDoc);
    } catch {
      if (currentId !== loadId) return;
      context.onStatus('error');
    }
  }

  async function render(canvas: HTMLCanvasElement, pageNumber = page.value): Promise<void> {
    const pdfDoc = doc.value;
    if (!pdfDoc) return;

    const props = context.pdfProps() ?? {};
    const scale = props.scale ?? 1;
    const rotation = props.rotation ?? 0;
    const target = Math.min(Math.max(pageNumber, 1), numPages.value || 1);
    if (target !== page.value) page.value = target;

    if (renderTask) {
      try {
        renderTask.cancel();
      } catch {
        /* ignore */
      }
    }
    if (activePage) {
      try {
        activePage.cleanup();
      } catch {
        /* ignore */
      }
    }

    const pdfPage = await pdfDoc.getPage(target);
    activePage = pdfPage;
    const viewport = pdfPage.getViewport({ scale, rotation });
    if (!canvas.getContext('2d')) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(viewport.width * dpr);
    canvas.height = Math.floor(viewport.height * dpr);
    canvas.style.width = `${Math.floor(viewport.width)}px`;
    canvas.style.height = `${Math.floor(viewport.height)}px`;

    const renderParams = {
      canvas,
      viewport,
      ...(dpr !== 1 ? { transform: [dpr, 0, 0, dpr, 0, 0] } : {}),
      ...props.renderParams,
    };
    const task = pdfPage.render(renderParams);
    renderTask = task;
    try {
      await task.promise;
    } catch (error) {
      if (!isCancelledError(error)) throw error;
    } finally {
      if (renderTask === task) renderTask = null;
    }
  }

  function goto(next: number): void {
    if (!doc.value || numPages.value === 0) return;
    page.value = Math.min(Math.max(next, 1), numPages.value);
  }

  function prev(): void {
    goto(page.value - 1);
  }

  function next(): void {
    goto(page.value + 1);
  }

  async function destroy(): Promise<void> {
    if (renderTask) {
      try {
        renderTask.cancel();
      } catch {
        /* ignore */
      }
      renderTask = null;
    }
    if (activePage) {
      try {
        activePage.cleanup();
      } catch {
        /* ignore */
      }
      activePage = null;
    }
    const task = loadingTask;
    loadingTask = null;
    doc.value = null;
    numPages.value = 0;
    page.value = 1;
    if (task) {
      try {
        await task.destroy();
      } catch {
        /* ignore */
      }
    }
  }

  return { doc, numPages, page, goto, prev, next, render, load, destroy };
}
