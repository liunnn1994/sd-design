import type { FilePreviewerStatus } from '@sdata/web-core/file-previewer/types';

import { StrictMode, useLayoutEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { usePdf } from '../../src/file-previewer/use-pdf.js';
import { createTestPdf } from './file-preview-pdf-data.js';
function Fixture() {
  const [status, setStatus] = useState<FilePreviewerStatus>('beforeLoad');
  const [scale, setScale] = useState(1);
  const [painted, setPainted] = useState(0);
  const canvas = useRef<HTMLCanvasElement>(null);
  const pdf = usePdf({
    src: () => '/actual-document.pdf',
    pdfProps: () => ({ documentParams: { data: createTestPdf() }, scale }),
    onStatus: setStatus,
  });
  useLayoutEffect(() => {
    void pdf.load();
  }, []);
  useLayoutEffect(() => {
    if (pdf.doc && canvas.current)
      void pdf.render(canvas.current).then(() => setPainted((value) => value + 1));
  }, [pdf.doc, pdf.page, scale]);
  return (
    <>
      <button onClick={pdf.next}>Next</button>
      <button onClick={pdf.prev}>Previous</button>
      <button onClick={() => setScale(2)}>Scale</button>
      <button
        onClick={() => {
          void pdf.destroy();
        }}
      >
        Destroy
      </button>
      <canvas ref={canvas} />
      <output data-testid="status">{status}</output>
      <output data-testid="page">
        {pdf.page}/{pdf.numPages}
      </output>
      <output data-testid="painted">{painted}</output>
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
