import type { RequestOption } from '@sdata/web-core/upload/types';

import { StrictMode, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { Upload, type UploadInstance } from '../../src/upload/upload.js';
import '../../styles/upload.scss';
const image =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="32" height="32"%3E%3Crect width="32" height="32" fill="red"/%3E%3C/svg%3E';
function Fixture() {
  const query = new URLSearchParams(location.search);
  const ref = useRef<UploadInstance>(null);
  const request = useRef<RequestOption>(null);
  const [events, setEvents] = useState<string[]>([]);
  return (
    <>
      <button onClick={() => ref.current?.submit()}>Submit</button>
      <button onClick={() => request.current?.onSuccess({ url: '/done' })}>Complete</button>
      <Upload
        ref={ref}
        data-testid="upload-root"
        title="Upload files"
        showFileList={!query.has('nolist')}
        tip={query.has('tip') ? 'Maximum one file' : undefined}
        onClick={query.has('nolist') ? () => setEvents((old) => [...old, 'click']) : undefined}
        autoUpload={!query.has('manual')}
        limit={1}
        listType={query.has('picture') ? 'picture' : 'text'}
        imagePreview={query.has('picture')}
        showLink={false}
        defaultFileList={
          query.has('picture')
            ? [{ uid: 'preview', name: 'preview.svg', status: 'done', url: image }]
            : []
        }
        action={`http://127.0.0.1:5192/${query.has('error') ? 'error' : query.has('slow') ? 'slow' : 'upload'}`}
        name="document"
        data={{ team: 'engineering' }}
        headers={{ 'X-Upload-Test': 'react-adapter' }}
        responseUrlKey="url"
        customRequest={
          query.has('real')
            ? undefined
            : (option) => {
                request.current = option;
                return { abort() {} };
              }
        }
        onError={(file) => setEvents((old) => [...old, `error:${file.name}`])}
        onSuccess={(file) => setEvents((old) => [...old, `success:${file.name}`])}
        onPreview={(file) => setEvents((old) => [...old, `preview:${file.name}`])}
      />
      <output>{events.join('|')}</output>
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
