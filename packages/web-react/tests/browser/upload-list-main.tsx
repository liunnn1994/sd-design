import type { FileItem } from '@sdata/web-core/upload/types';

import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { UploadList } from '../../src/upload/list.js';
import '../../styles/upload.scss';

function Fixture() {
  const query = new URLSearchParams(location.search);
  const showActions = !query.has('hide-actions');
  const [files, setFiles] = useState<FileItem[]>([
    {
      uid: 'one',
      name: 'report.pdf',
      status: query.has('error') ? 'error' : query.has('init') ? 'init' : 'done',
      percent: 0.5,
      url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="32" height="32"/%3E',
    },
    ...(query.has('rows') ? [{ uid: 'two', name: 'notes.txt' }] : []),
  ]);
  const [events, setEvents] = useState<string[]>([]);
  const record = (value: string) => setEvents((old) => [...old, value]);
  return (
    <>
      {query.has('rows') && (
        <button onClick={() => setFiles((current) => current.slice(1))}>Remove first file</button>
      )}
      <UploadList
        fileList={files}
        listType={query.has('card') ? 'picture-card' : query.has('picture') ? 'picture' : 'text'}
        showRemoveButton={showActions}
        showPreviewButton={showActions}
        showStartButton={showActions}
        showRetryButton={showActions}
        showCancelButton={showActions}
        showLink={query.has('link')}
        download
        imageLoading="lazy"
        renderFileName={query.has('custom') ? (file) => <b>Custom {file.name}</b> : undefined}
        renderImage={query.has('custom') ? () => <span>Custom image</span> : undefined}
        renderExtraButton={
          query.has('custom') ? (file) => <button>Extra action for {file.name}</button> : undefined
        }
        renderItem={
          query.has('rows') ? (file) => <input aria-label={file.name} defaultValue="" /> : undefined
        }
        onUpload={(file) => {
          record(`upload:${file.uid}`);
          setFiles([{ ...file, status: 'uploading' }]);
        }}
        onAbort={(file) => {
          record(`abort:${file.uid}`);
          setFiles([{ ...file, status: 'error' }]);
        }}
        onRemove={(file) => {
          record(`remove:${file.uid}`);
          setFiles([]);
        }}
        onPreview={(file) => record(`preview:${file.uid}`)}
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
