import type { RequestOption } from '@sdata/web-core/upload/types';

import { StrictMode, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { useUpload } from '../../src/upload/use-upload.js';
function UploadFixture({ record }: { record(message: string): void }) {
  const query = new URLSearchParams(location.search);
  const request = useRef<RequestOption>(null);
  const upload = useUpload(
    {
      autoUpload: !query.has('manual'),
      limit: 1,
      onBeforeUpload: (file) => file.name !== 'reject.txt',
      customRequest: (option) => {
        request.current = option;
        record('request');
        return { abort: () => record('abort') };
      },
      onFileListChange: () => record('list'),
      onChange: () => record('change'),
      onSuccess: () => record('success'),
      onError: () => record('error'),
      onExceedLimit: () => record('exceed'),
    },
    () => record('form'),
  );
  return (
    <>
      <input
        type="file"
        multiple
        onChange={(event) => upload.uploadFiles([...(event.target.files ?? [])])}
      />
      <button onClick={() => upload.submit()}>Submit</button>
      <button onClick={() => upload.files[0] && upload.abort(upload.files[0])}>Abort</button>
      <button onClick={() => upload.files[0] && upload.remove(upload.files[0])}>Remove</button>
      <button onClick={() => request.current?.onSuccess({ url: '/file' })}>Success</button>
      <button onClick={() => request.current?.onProgress(0.5)}>Progress</button>
      <output data-testid="files">
        {JSON.stringify(
          upload.files.map(({ name, status, percent }) => ({ name, status, percent })),
        )}
      </output>
    </>
  );
}
function Fixture() {
  const [events, setEvents] = useState<string[]>([]);
  const [mounted, setMounted] = useState(true);
  return (
    <>
      {mounted && <UploadFixture record={(message) => setEvents((old) => [...old, message])} />}
      <button onClick={() => setMounted(false)}>Unmount</button>
      <output data-testid="events">{events.join('|')}</output>
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
