import type { FilePreviewerType } from '@sdata/web-core/file-previewer/types';

import { StrictMode, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { useFilePreview } from '../../src/file-previewer/use-preview.js';
function Fixture() {
  const query = new URLSearchParams(location.search);
  const [type, setType] = useState<FilePreviewerType>(query.has('media') ? 'video' : 'image');
  const [src, setSrc] = useState('first');
  const [events, setEvents] = useState<string[]>([]);
  const pending = useRef<(() => void)[]>([]);
  const record = (event: string) => setEvents((old) => [...old, event]);
  const state = useFilePreview(
    {
      src,
      type,
      defaultVisible: true,
      visible: query.has('controlled') ? true : undefined,
      fullscreen: !query.has('inline'),
      slots: query.has('custom') ? ['content'] : [],
      withMediaSkin: true,
      onClose: () => record('close'),
      onVisibleChange: (value) => record(`visible:${value}`),
    },
    {
      destroyPdf: async () => {},
      loadPdf: async () => record('pdf'),
      ensureMedia: () => new Promise<void>((resolve) => pending.current.push(resolve)),
      focusAfterRender: () => {},
    },
  );
  return (
    <>
      <button onClick={state.foundation.close}>Close</button>
      <button onClick={state.foundation.loaded}>Load</button>
      <button onClick={state.foundation.error}>Error</button>
      <button onClick={() => setType('image')}>Image</button>
      <button onClick={() => setSrc('second')}>Replace</button>
      <button onClick={() => pending.current.forEach((resolve) => resolve())}>Resolve media</button>
      <div
        tabIndex={0}
        data-testid="keyboard"
        onKeyDown={(event) => state.foundation.keydown(event.nativeEvent)}
      >
        Keyboard
      </div>
      <output data-testid="status">{state.status}</output>
      <output data-testid="visible">{String(state.visible)}</output>
      <output data-testid="render">{String(state.shouldRender)}</output>
      <output data-testid="events">{events.join('|')}</output>
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
