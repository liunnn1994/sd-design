import type { PDFDocumentProxy, PdfContext } from '@sdata/web-core/file-previewer/pdf';

import { createPdfController } from '@sdata/web-core/file-previewer/pdf';
import { loadPdfModule, resolvePdfWorker } from '@sdata/web-core/file-previewer/pdf-loader';
import { useLayoutEffect, useReducer, useRef, useState } from 'react';

export function usePdf(context: PdfContext) {
  const current = useRef(context);
  current.current = context;
  const state = useRef({ doc: null as PDFDocumentProxy | null, numPages: 0, page: 1 });
  const [, render] = useReducer((value: number) => value + 1, 0);
  const [controller] = useState(() =>
    createPdfController(
      {
        src: () => current.current.src(),
        pdfProps: () => current.current.pdfProps(),
        onStatus: (status) => current.current.onStatus(status),
      },
      {
        get doc() {
          return state.current.doc;
        },
        get numPages() {
          return state.current.numPages;
        },
        get page() {
          return state.current.page;
        },
        isServer: typeof window === 'undefined',
        get pixelRatio() {
          return typeof window === 'undefined' ? 1 : window.devicePixelRatio;
        },
        setDoc: (doc) => {
          state.current.doc = doc;
          render();
        },
        setNumPages: (numPages) => {
          state.current.numPages = numPages;
          render();
        },
        setPage: (page) => {
          state.current.page = page;
          render();
        },
        loadModule: loadPdfModule,
        resolveWorker: (props) =>
          resolvePdfWorker(props, () =>
            import('@sdata/web-core/file-previewer/pdf-worker-url').then(
              (module) => module.default,
            ),
          ),
      },
    ),
  );
  useLayoutEffect(
    () => () => {
      void controller.destroy();
    },
    [controller],
  );
  return { ...state.current, ...controller };
}
