import type { RequestOption } from '@sdata/web-core/upload/types';

import { StrictMode, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { useUpload } from '../../src/upload/use-upload.js';
function UploadFixture({
  record,
  holdValidation,
}: {
  record(message: string): void;
  holdValidation(resolve: (allowed: boolean) => void): void;
}) {
  const query = new URLSearchParams(location.search);
  const requests = useRef<RequestOption[]>([]);
  const upload = useUpload(
    {
      autoUpload: !query.has('manual'),
      limit: 1,
      onBeforeUpload: (file) => {
        if (!query.has('pending')) return file.name !== 'reject.txt';
        record('validation');
        return new Promise<boolean>(holdValidation).then((allowed) => {
          record('validated');
          return allowed;
        });
      },
      customRequest: (option) => {
        requests.current.push(option);
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
      <button onClick={() => upload.files[0] && upload.submit(upload.files[0])}>
        Submit first file
      </button>
      <button onClick={() => upload.files[0] && upload.abort(upload.files[0])}>Abort</button>
      <button onClick={() => upload.files[0] && upload.remove(upload.files[0])}>Remove</button>
      <button onClick={() => requests.current.at(-1)?.onSuccess({ url: '/file' })}>Success</button>
      <button onClick={() => requests.current.at(-1)?.onProgress(0.5)}>Progress</button>
      <button
        onClick={() => {
          const first = requests.current[0];
          first?.onProgress(0.1);
          first?.onSuccess({ url: '/old' });
          first?.onError('Old request');
        }}
      >
        Replay first request
      </button>
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
  const validation = useRef<(allowed: boolean) => void>(undefined);
  return (
    <>
      {mounted && (
        <UploadFixture
          record={(message) => setEvents((old) => [...old, message])}
          holdValidation={(resolve) => {
            validation.current = resolve;
          }}
        />
      )}
      <button onClick={() => setMounted(false)}>Unmount</button>
      <button onClick={() => validation.current?.(true)}>Allow upload</button>
      <output data-testid="events">{events.join('|')}</output>
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
