import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { UploadButton } from '../../src/upload/button.js';
import '../../styles/upload.scss';
function Fixture() {
  const query = new URLSearchParams(location.search);
  const [files, setFiles] = useState<string[]>([]);
  const [paths, setPaths] = useState<string[]>([]);
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
        onButtonClick={
          query.has('programmatic')
            ? async () => {
                const transfer = new DataTransfer();
                transfer.items.add(new File(['payload'], 'from-picker.txt'));
                return transfer.files;
              }
            : undefined
        }
        uploadFiles={(selected) => {
          setFiles((old) => [...old, ...selected.map((file) => file.name)]);
          if (query.has('directory'))
            setPaths((old) => [...old, ...selected.map((file) => file.webkitRelativePath)]);
        }}
      />
      <output>{JSON.stringify(files)}</output>
      {query.has('directory') && <span data-testid="paths">{JSON.stringify(paths)}</span>}
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
