import type { FileItem } from '@sdata/web-core/upload/types';

import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { Form, FormItem } from '../../src/form/index.js';
import { Upload } from '../../src/upload/upload.js';
import '../../styles/upload.scss';
import '../../styles/form.scss';
function Fixture() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [, render] = useState(0);
  const [disabled, setDisabled] = useState(false);
  return (
    <>
      <button onClick={() => setFiles([{ uid: 'external', name: 'original.txt', status: 'done' }])}>
        Seed
      </button>
      <button
        onClick={() => {
          if (files[0]) {
            files[0].name = 'renamed.txt';
            files[0].status = 'error';
          }
          render((old) => old + 1);
        }}
      >
        Mutate
      </button>
      <button
        onClick={() => {
          files.splice(0);
          render((old) => old + 1);
        }}
      >
        Clear external
      </button>
      <button onClick={() => setDisabled(!disabled)}>Disable</button>
      <Form
        model={{ files }}
        disabled={disabled}
        rules={{ files: [{ required: true, message: 'Attach a file' }] }}
      >
        <FormItem field="files" validateTrigger="change">
          <Upload fileList={files} onFileListChange={setFiles} autoUpload={false} />
        </FormItem>
      </Form>
      <output>{files.length}</output>
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
