import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { FilePdfView } from '../../src/file-previewer/pdf-view.js';
import { createTestPdf } from './file-preview-pdf-data.js';
import '../../styles/file-previewer.scss';
function Fixture() {
  const query = new URLSearchParams(location.search);
  const [documentParams] = useState(() => ({
    data: query.has('invalid') ? new Uint8Array([1, 2, 3]) : createTestPdf(),
  }));
  const [scale, setScale] = useState(1);
  const [custom, setCustom] = useState(query.has('custom'));
  return (
    <>
      <button onClick={() => setScale(2)}>Scale</button>
      <button onClick={() => setCustom(!custom)}>Toggle custom</button>
      <div className="sd-file-previewer sd-file-previewer-inline">
        <FilePdfView
          src="/real-view.pdf"
          pdfProps={{ documentParams, scale }}
          renderPdf={
            custom
              ? (state) => (
                  <button data-testid="custom-pdf" onClick={() => state.goto(2)}>
                    {state.status}:{state.page}/{state.numPages}
                  </button>
                )
              : undefined
          }
        />
      </div>
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
