/** @jsxImportSource react */
import type { PDFDocumentProxy } from 'pdfjs-dist';

import { Button, FilePreviewer } from '@sdata/web-react';
import { useEffect, useRef } from 'react';
import { createElement, useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

function PdfSlotCanvas({
  doc,
  page,
  render,
}: {
  doc?: PDFDocumentProxy | null;
  page: number;
  render?(canvas: HTMLCanvasElement, page?: number): Promise<void>;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!doc || !canvas.current || !render) return;
    let cancelled = false;
    setError('');
    void render(canvas.current, page).catch((cause: unknown) => {
      if (!cancelled) setError(String(cause));
    });
    return () => {
      cancelled = true;
    };
  }, [doc, page, render]);
  return (
    <>
      <canvas ref={canvas} data-v-336f9fec="" className="pdf-slot__canvas" />
      {error && <p role="alert">{error}</p>}
    </>
  );
}

export default function Example() {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Button
        data-v-336f9fec=""
        type={'primary'}
        onClick={() => {
          setVisible(true);
        }}
      >
        {'自定义 PDF 渲染'}
      </Button>
      <FilePreviewer
        data-v-336f9fec=""
        visible={visible}
        onVisibleChange={(next) => setVisible(next as typeof visible)}
        title={'自定义 PDF 渲染'}
        type={'pdf'}
        src={'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'}
        renderPdf={({ doc, page, numPages, render, prev, next }) => (
          <>
            <div data-v-336f9fec="" className={'pdf-slot'}>
              <div data-v-336f9fec="" className={'pdf-slot__canvas-wrap'}>
                <PdfSlotCanvas data-v-336f9fec="" doc={doc} page={page} render={render} />
              </div>
              <div data-v-336f9fec="" className={'pdf-slot__toolbar'}>
                <Button data-v-336f9fec="" size={'small'} disabled={page <= 1} onClick={prev}>
                  {'上一页'}
                </Button>
                <span data-v-336f9fec="" className={'pdf-slot__page'}>
                  {formatValue(page)}
                  {' / '}
                  {formatValue(numPages)}
                </span>
                <Button
                  data-v-336f9fec=""
                  size={'small'}
                  disabled={page >= numPages}
                  onClick={next}
                >
                  {'下一页'}
                </Button>
              </div>
            </div>
          </>
        )}
      />
      <style>
        {
          '\n.pdf-slot[data-v-336f9fec] {\n    display: flex;\n    flex-direction: column;\n    gap: 12px;\n    width: min(720px, 100%);\n    height: 100%;\n    max-height: 78vh;\n}\n.pdf-slot__canvas-wrap[data-v-336f9fec] {\n    flex: 1;\n    display: flex;\n    justify-content: center;\n    overflow: auto;\n    background: #fff;\n    border-radius: 8px;\n}\n.pdf-slot__canvas[data-v-336f9fec] {\n    display: block;\n}\n.pdf-slot__toolbar[data-v-336f9fec] {\n    display: flex;\n    flex-shrink: 0;\n    align-items: center;\n    justify-content: center;\n    gap: 12px;\n}\n.pdf-slot__page[data-v-336f9fec] {\n    min-width: 64px;\n    color: #fff;\n    text-align: center;\n}\n'
        }
      </style>
    </>
  );
}
