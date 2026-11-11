import { StrictMode, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import type { FilePreviewerInstance, FilePreviewerType } from '../../src/file-previewer/index.js';

import { FilePreviewer } from '../../src/file-previewer/index.js';
import { createTestPdf } from './file-preview-pdf-data.js';
import '../../styles/file-previewer.scss';

const image =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="80"><rect width="100" height="80" fill="teal"/></svg>',
  );
function Fixture() {
  const query = new URLSearchParams(location.search);
  const type = (query.get('type') || 'image') as FilePreviewerType;
  const [visible, setVisible] = useState(false);
  const [bubbles, setBubbles] = useState(0);
  const [events, setEvents] = useState<string[]>([]);
  const [documentParams] = useState(() => ({ data: createTestPdf() }));
  const api = useRef<FilePreviewerInstance>(null);
  return (
    <div onKeyDown={() => setBubbles((count) => count + 1)}>
      <button onClick={() => setVisible(true)}>Open</button>
      <button onClick={() => api.current?.close()}>Ref close</button>
      <button onClick={() => api.current?.onError()}>Ref error</button>
      <button onClick={() => api.current?.onLoad()}>Ref loaded</button>
      <output>{events.join(',')}</output>
      <span data-testid="bubbles">{bubbles}</span>
      <div id="preview-container" style={{ position: 'relative', width: 600, height: 500 }} />
      <FilePreviewer
        ref={api}
        src={type === 'image' ? image : '/test.pdf'}
        type={type}
        title="Actual preview"
        fullscreen={!query.has('inline')}
        visible={query.has('uncontrolled') ? undefined : visible}
        defaultVisible={query.has('uncontrolled')}
        maskClosable={!query.has('locked')}
        escToClose={!query.has('locked')}
        closable={!query.has('locked')}
        popupContainer={query.has('container') ? '#preview-container' : undefined}
        renderToBody={!query.has('local')}
        pdfProps={{ documentParams }}
        mediaProps={{ skin: 'native' }}
        onClose={() => setEvents((old) => [...old, 'close'])}
        onVisibleChange={(next) => {
          setEvents((old) => [...old, String(next)]);
          setVisible(next);
        }}
        renderContent={
          query.has('custom')
            ? (state) => (
                <button data-testid="custom" onClick={state.close}>
                  {state.type}:{state.status}:{String(state.visible)}
                </button>
              )
            : undefined
        }
      />
    </div>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
