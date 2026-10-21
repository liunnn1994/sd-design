import type {
  PDFDocumentLoadingTask,
  PDFDocumentProxy,
  PDFPageProxy,
  RenderTask,
} from 'pdfjs-dist';

import type { FilePreviewerPdfProps, FilePreviewerStatus } from './types.js';
export type { PDFDocumentProxy } from 'pdfjs-dist';
export type PdfJsModule = typeof import('pdfjs-dist');

export interface PdfContext {
  src: () => string;
  pdfProps: () => FilePreviewerPdfProps | undefined;
  onStatus: (status: FilePreviewerStatus) => void;
}

function isCancelledError(error: unknown): boolean {
  return (
    error !== null &&
    typeof error === 'object' &&
    'name' in error &&
    (error as { name: unknown }).name === 'RenderingCancelledException'
  );
}

export function createPdfController(
  context: PdfContext,
  adapter: {
    readonly doc: PDFDocumentProxy | null;
    readonly numPages: number;
    readonly page: number;
    readonly isServer: boolean;
    readonly pixelRatio: number;
    setDoc(value: PDFDocumentProxy | null): void;
    setNumPages(value: number): void;
    setPage(value: number): void;
    loadModule(): Promise<PdfJsModule>;
    resolveWorker(props: FilePreviewerPdfProps): Promise<string | undefined>;
  },
) {
  let loadingTask: PDFDocumentLoadingTask | null = null;
  let renderTask: RenderTask | null = null;
  let activePage: PDFPageProxy | null = null;
  let loadId = 0;
  let renderId = 0;

  async function load(): Promise<void> {
    const url = context.src();
    if (adapter.isServer) return;
    if (!url) {
      await destroy();
      return;
    }

    const currentId = ++loadId;
    context.onStatus('loading');
    try {
      const pdfjs = await adapter.loadModule();
      if (currentId !== loadId) return;

      const props = context.pdfProps() ?? {};
      const workerSrc = await adapter.resolveWorker(props);
      if (currentId !== loadId) return;

      await releaseResources();
      if (currentId !== loadId) return;

      pdfjs.GlobalWorkerOptions.workerPort =
        props.worker === false ? null : (props.workerPort ?? null);
      if (workerSrc) pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
      loadingTask = pdfjs.getDocument({ url, ...props.documentParams });
      const pdfDoc = await loadingTask.promise;
      if (currentId !== loadId) {
        // A newer load started; the previous loadingTask was already destroyed by it.
        return;
      }

      adapter.setDoc(pdfDoc);
      adapter.setNumPages(pdfDoc.numPages);
      adapter.setPage(Math.min(Math.max(props.page ?? 1, 1), pdfDoc.numPages));
      context.onStatus('loaded');
      props.onDocumentLoad?.(pdfDoc);
    } catch {
      if (currentId !== loadId) return;
      context.onStatus('error');
    }
  }

  async function render(canvas: HTMLCanvasElement, pageNumber = adapter.page): Promise<void> {
    const pdfDoc = adapter.doc;
    if (!pdfDoc) return;
    const documentId = loadId;
    const currentRenderId = ++renderId;

    const props = context.pdfProps() ?? {};
    const scale = props.scale ?? 1;
    const rotation = props.rotation ?? 0;
    const target = Math.min(Math.max(pageNumber, 1), adapter.numPages || 1);
    if (target !== adapter.page) adapter.setPage(target);

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

    try {
      const pdfPage = await pdfDoc.getPage(target);
      if (documentId !== loadId || adapter.doc !== pdfDoc || currentRenderId !== renderId) return;
      activePage = pdfPage;
      const viewport = pdfPage.getViewport({ scale, rotation });
      if (!canvas.getContext('2d')) return;

      const dpr = adapter.pixelRatio || 1;
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
      } finally {
        if (renderTask === task) renderTask = null;
      }
    } catch (error) {
      if (documentId === loadId && currentRenderId === renderId && !isCancelledError(error)) {
        context.onStatus('error');
      }
    }
  }

  function goto(next: number): void {
    if (!adapter.doc || adapter.numPages === 0) return;
    adapter.setPage(Math.min(Math.max(next, 1), adapter.numPages));
  }

  function prev(): void {
    goto(adapter.page - 1);
  }

  function next(): void {
    goto(adapter.page + 1);
  }

  async function destroy(): Promise<void> {
    loadId++;
    await releaseResources();
  }

  async function releaseResources(): Promise<void> {
    renderId++;
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
    adapter.setDoc(null);
    adapter.setNumPages(0);
    adapter.setPage(1);
    if (task) {
      try {
        await task.destroy();
      } catch {
        /* ignore */
      }
    }
  }

  return { goto, prev, next, render, load, destroy };
}
