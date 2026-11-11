/** @jsxImportSource react */
import { Button, Sender, SenderHeader } from '@sdata/web-react';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const [value, setValue] = useState('');
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  function handlePasteFile(fileList: FileList) {
    setFiles(Array.from(fileList));
    setOpen(true);
  }
  function clear() {
    setValue('');
    setFiles([]);
    setOpen(false);
  }
  function formatSize(size: number) {
    return size < 1024 ? `${size} B` : `${(size / 1024).toFixed(1)} KB`;
  }

  return (
    <>
      <div data-v-07bf29ea="" className={'sender-demo'}>
        <Sender
          data-v-07bf29ea=""
          value={value}
          onValueChange={(next) => setValue(next as typeof value)}
          placeholder={'复制文件或图片后，在这里粘贴'}
          onPasteFile={handlePasteFile}
          onSubmit={clear}
          slots={{
            header: () => (
              <>
                <SenderHeader
                  data-v-07bf29ea=""
                  open={open}
                  onOpenChange={(next) => setOpen(next as typeof open)}
                  title={'待发送文件'}
                  closable={files.length > 0}
                  forceRender={true}
                >
                  {files.length ? (
                    <ul data-v-07bf29ea="" className={'sender-demo-files'}>
                      {files.map((file) => (
                        <li data-v-07bf29ea="" key={`${file.name}-${file.size}`}>
                          <span data-v-07bf29ea="">{formatValue(file.name)}</span>
                          <span data-v-07bf29ea="">{formatValue(formatSize(file.size))}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span data-v-07bf29ea="" className={'sender-demo-empty'}>
                      {'尚未粘贴文件'}
                    </span>
                  )}
                </SenderHeader>
              </>
            ),
            prefix: () => (
              <>
                <Button
                  data-v-07bf29ea=""
                  size={'small'}
                  type={'text'}
                  onClick={() => {
                    setOpen(!open);
                  }}
                >
                  {' 文件 '}
                  {formatValue(files.length ? `(${files.length})` : '')}
                </Button>
              </>
            ),
          }}
        />
        <p data-v-07bf29ea="" className={'sender-demo-tip'}>
          {' 当剪贴板只包含文件时触发 paste-file；普通文本仍按默认粘贴行为写入输入框。 '}
        </p>
      </div>
      <style>
        {
          '\n.sender-demo[data-v-07bf29ea] {\n    display: grid;\n    gap: 8px;\n}\n.sender-demo-files[data-v-07bf29ea] {\n    display: grid;\n    gap: 8px;\n    margin: 0;\n    padding: 0;\n    list-style: none;\n}\n.sender-demo-files li[data-v-07bf29ea] {\n    display: flex;\n    justify-content: space-between;\n    gap: 16px;\n    color: var(--sd-color-text-2);\n    font-size: 13px;\n}\n.sender-demo-empty[data-v-07bf29ea],\n  .sender-demo-tip[data-v-07bf29ea] {\n    color: var(--sd-color-text-3);\n    font-size: 13px;\n}\n.sender-demo-tip[data-v-07bf29ea] {\n    margin: 0;\n    line-height: 1.5;\n}\n'
        }
      </style>
    </>
  );
}
