/** @jsxImportSource react */
import type { FileItem, UploadInstance } from '@sdata/web-react';

import { Button, Space, Upload } from '@sdata/web-react';
import { type ComponentRef, type MouseEvent, useRef, useState } from 'react';

export default function Example() {
  const uploadRef = useRef<ComponentRef<typeof Upload> | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const submitOne = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    console.log(files);
    uploadRef.current?.submit(files.find((x) => x.status === 'init'));
  };
  const submit = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    uploadRef.current?.submit();
  };
  const onChange = (fileList: FileItem[]) => {
    setFiles(fileList);
  };

  return (
    <>
      <div>
        <Upload
          action={'/'}
          autoUpload={false}
          ref={uploadRef}
          onChange={onChange}
          multiple={true}
          uploadButton={
            <>
              <Space>
                <Button>{' 选择文件'}</Button>
                <Button type={'primary'} onClick={submit}>
                  {' 开始上传'}
                </Button>
                <Button type={'primary'} onClick={submitOne}>
                  {' 仅上传一个文件 '}
                </Button>
              </Space>
            </>
          }
        />
      </div>
    </>
  );
}
