import type { PDFDocumentProxy } from '@sdata/web-core/file-previewer/pdf';

import type { ShallowRef } from 'vue';
import { shallowRef } from 'vue';

import { createPdfController } from '@sdata/web-core/file-previewer/pdf';
import { loadPdfModule, resolvePdfWorker } from '@sdata/web-core/file-previewer/pdf-loader';

import type { FilePreviewerPdfProps, FilePreviewerStatus } from './types';

import { isServerRendering } from '../_utils/dom';

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

let bundledWorkerSrcPromise: Promise<string> | undefined;
function defaultWorkerSrc(): Promise<string> {
  if (!bundledWorkerSrcPromise) {
    bundledWorkerSrcPromise = import('./pdfjs-worker-url').then((module) => module.default);
  }
  return bundledWorkerSrcPromise;
}

/**
 * @zh 管理 pdf.js 文档加载、分页与画布渲染的生命周期，内部按请求 id 防竞态。
 * @en Manages the pdf.js document loading, pagination and canvas rendering lifecycle, with internal request-id based race protection.
 */
export function usePdfJs(context: UsePdfJsContext): UsePdfJsReturn {
  const doc = shallowRef<PDFDocumentProxy | null>(null);
  const numPages = shallowRef(0);
  const page = shallowRef(1);
  const controller = createPdfController(context, {
    get doc() {
      return doc.value;
    },
    get numPages() {
      return numPages.value;
    },
    get page() {
      return page.value;
    },
    isServer: isServerRendering,
    get pixelRatio() {
      return window.devicePixelRatio;
    },
    setDoc(value) {
      doc.value = value;
    },
    setNumPages(value) {
      numPages.value = value;
    },
    setPage(value) {
      page.value = value;
    },
    loadModule: loadPdfModule,
    resolveWorker: (props) => resolvePdfWorker(props, defaultWorkerSrc),
  });
  return { doc, numPages, page, ...controller };
}
