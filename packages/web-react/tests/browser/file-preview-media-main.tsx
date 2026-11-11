import type { FilePreviewerStatus } from '@sdata/web-core/file-previewer/types';

import { createMediaLoader } from '@sdata/web-core/file-previewer/media';
import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { FileMediaView } from '../../src/file-previewer/media-view.js';
import '../../styles/file-previewer.scss';

// A real, one-second PCM WAV keeps codec and network dependencies out of this fixture.
const wav = new ArrayBuffer(44 + 16000);
const data = new DataView(wav);
const text = (offset: number, value: string) =>
  [...value].forEach((char, i) => data.setUint8(offset + i, char.charCodeAt(0)));
text(0, 'RIFF');
data.setUint32(4, wav.byteLength - 8, true);
text(8, 'WAVE');
text(12, 'fmt ');
data.setUint32(16, 16, true);
data.setUint16(20, 1, true);
data.setUint16(22, 1, true);
data.setUint32(24, 8000, true);
data.setUint32(28, 16000, true);
data.setUint16(32, 2, true);
data.setUint16(34, 16, true);
text(36, 'data');
data.setUint32(40, 16000, true);
const source = URL.createObjectURL(new Blob([wav], { type: 'audio/wav' }));
const ensureMedia = createMediaLoader();
function Fixture() {
  const query = new URLSearchParams(location.search);
  const type = query.has('video') ? 'video' : 'audio';
  const skin = query.has('skin') ? 'minimal' : 'native';
  const [status, setStatus] = useState<FilePreviewerStatus>('loading');
  const [loads, setLoads] = useState(0);
  const [errors, setErrors] = useState(0);
  const [custom, setCustom] = useState(query.has('custom'));
  const [src, setSrc] = useState(source);
  const [ready, setReady] = useState(skin === 'native');
  useEffect(() => {
    if (skin !== 'native') void ensureMedia(type).then(() => setReady(true));
  }, [type, skin]);
  return (
    <>
      <output>
        {status}:{loads}:{errors}
      </output>
      <button
        onClick={() => {
          setStatus('loading');
          setSrc('data:audio/wav;base64,AQID');
        }}
      >
        Invalid source
      </button>
      <button onClick={() => setCustom(!custom)}>Toggle custom</button>
      {ready && (
        <FileMediaView
          src={src}
          type={type}
          status={status}
          mediaProps={{
            skin,
            preload: 'auto',
            onLoadedData: () => setLoads((n) => n + 1),
            onError: () => setErrors((n) => n + 1),
            playerProps: { 'data-player': 'yes' },
            skinProps: { 'data-skin': 'yes' },
          }}
          close={() => setStatus('beforeLoad')}
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
          renderMedia={
            custom
              ? (state) => (
                  <button data-testid="custom" onClick={state.onError}>
                    {state.skin}:{String(state.useVideoJs)}:{state.status}
                  </button>
                )
              : undefined
          }
        />
      )}
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
