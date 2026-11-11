import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { UploadButton } from '../../src/upload/button.js';
import '../../styles/upload.scss';
function Fixture() {
  const query = new URLSearchParams(location.search);
  const [files, setFiles] = useState<string[]>([]);
  const [disabled, setDisabled] = useState(query.has('disabled'));
  return (
    <>
      <button onClick={() => setDisabled(!disabled)}>Toggle disabled</button>
      <UploadButton
        draggable
        disabled={disabled}
        multiple={query.has('multiple')}
        accept=".txt"
        directory={query.has('directory')}
        listType={query.has('card') ? 'picture-card' : 'text'}
        tip="Text files"
        uploadFiles={(selected) =>
          setFiles((old) => [...old, ...selected.map((file) => file.name)])
        }
      />
      <output>{JSON.stringify(files)}</output>
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
