import type {
  FilePreviewerPdfProps,
  FilePreviewerPdfSlotProps,
  FilePreviewerStatus,
} from '@sdata/web-core/file-previewer/types';
import type { ReactNode } from 'react';

import { useLayoutEffect, useRef, useState } from 'react';

import { usePrefix } from '../config-provider/index.js';
import IconLoading from '../icon/icon-loading.js';
import { useI18n } from '../locale/index.js';
import { usePdf } from './use-pdf.js';

export interface FilePdfViewProps {
  src: string;
  pdfProps?: FilePreviewerPdfProps | undefined;
  close?(): void;
  onStatus?(status: FilePreviewerStatus): void;
  status?: FilePreviewerStatus;
  renderPdf?: ((state: FilePreviewerPdfSlotProps) => ReactNode) | undefined;
}
export function FilePdfView({
  src,
  pdfProps,
  close,
  onStatus,
  renderPdf,
  status: controlledStatus,
}: FilePdfViewProps) {
  const prefix = usePrefix('file-previewer');
  const { t } = useI18n();
  const [localStatus, setStatus] = useState<FilePreviewerStatus>('beforeLoad');
  const status = controlledStatus ?? localStatus;
  const changeStatus = (next: FilePreviewerStatus) => {
    setStatus(next);
    onStatus?.(next);
  };
  const canvas = useRef<HTMLCanvasElement>(null);
  const pdf = usePdf({
    src: () => src,
    pdfProps: () => pdfProps,
    onStatus: changeStatus,
  });
  useLayoutEffect(() => {
    void pdf.load();
  }, [src, pdfProps?.documentParams, pdfProps?.worker, pdfProps?.workerPort, pdfProps?.workerSrc]);
  useLayoutEffect(() => {
    if (!canvas.current) return;
    if (!pdf.doc) {
      canvas.current.width = 0;
      canvas.current.height = 0;
      return;
    }
    void pdf.render(canvas.current, pdf.page);
  }, [pdf.doc, pdf.page, pdfProps?.scale, pdfProps?.rotation, renderPdf]);
  const loading = status === 'beforeLoad' || status === 'loading';
  return (
    <>
      {renderPdf ? (
        renderPdf({
          src,
          status,
          loading,
          loaded: status === 'loaded',
          error: status === 'error',
          doc: pdf.doc,
          page: pdf.page,
          numPages: pdf.numPages,
          goto: pdf.goto,
          prev: pdf.prev,
          next: pdf.next,
          render: pdf.render,
          close: () => close?.(),
          onLoad: () => changeStatus('loaded'),
          onError: () => changeStatus('error'),
        })
      ) : (
        <div className={`${prefix}-pdf`}>
          <div className={`${prefix}-pdf-canvas-wrap`}>
            <canvas ref={canvas} className={`${prefix}-pdf-canvas`} />
          </div>
          {pdf.numPages > 1 && (
            <div className={`${prefix}-pdf-toolbar`}>
              <button
                type="button"
                className={`${prefix}-pdf-btn`}
                disabled={pdf.page <= 1}
                aria-label={t('a11y.prevPage')}
                onClick={pdf.prev}
              >
                ‹
              </button>
              <span className={`${prefix}-pdf-page`}>
                {pdf.page} / {pdf.numPages}
              </span>
              <button
                type="button"
                className={`${prefix}-pdf-btn`}
                disabled={pdf.page >= pdf.numPages}
                aria-label={t('a11y.nextPage')}
                onClick={pdf.next}
              >
                ›
              </button>
            </div>
          )}
        </div>
      )}
      {loading && (
        <div className={`${prefix}-loading`} role="status" aria-label={t('a11y.loading')}>
          <IconLoading />
        </div>
      )}
      {status === 'error' && (
        <div className={`${prefix}-error`} role="alert">
          {t('filePreview.loadFailed')}
        </div>
      )}
    </>
  );
}
