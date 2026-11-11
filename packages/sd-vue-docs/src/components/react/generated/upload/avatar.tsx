/** @jsxImportSource react */
import type { FileItem } from '@sdata/web-react';

import { Progress, Space, Upload } from '@sdata/web-react';
import { IconEdit, IconPlus } from '@sdata/web-react/icon';
import { useState } from 'react';
function classNames(value: unknown): string {
  return Array.isArray(value)
    ? value.map(classNames).filter(Boolean).join(' ')
    : value && typeof value === 'object'
      ? Object.entries(value)
          .filter(([, active]) => active)
          .map(([name]) => name)
          .join(' ')
      : typeof value === 'string'
        ? value
        : '';
}

export default function Example() {
  const [file, setFile] = useState<FileItem | undefined | undefined>(undefined);
  const onChange = (_: FileItem[], currentFile: FileItem) => {
    setFile({
      ...currentFile,
      // url: URL.createObjectURL(currentFile.file),
    });
  };
  const onProgress = (currentFile: FileItem) => {
    setFile(currentFile);
  };

  return (
    <>
      <Space direction={'vertical'} className={'sd:w-full'}>
        <Upload
          action={'/'}
          fileList={file ? [file] : []}
          showFileList={false}
          onChange={onChange}
          onProgress={onProgress}
          uploadButton={
            <>
              <div
                className={classNames(
                  `sd-upload-list-item${
                    file && file.status === 'error' ? 'sd-upload-list-item-error' : ''
                  }`,
                )}
              >
                {file && file.url ? (
                  <div className={'sd-upload-list-picture custom-upload-avatar'}>
                    <img src={file.url} alt={'上传预览'} />
                    <div className={'sd-upload-list-picture-mask'}>
                      <IconEdit />
                    </div>
                    {file.status === 'uploading' &&
                    file.percent !== undefined &&
                    file.percent < 100 ? (
                      <Progress
                        percent={file.percent}
                        type={'circle'}
                        size={'mini'}
                        className={
                          'sd:absolute sd:left-1/2 sd:top-1/2 sd:-translate-x-1/2 sd:-translate-y-1/2'
                        }
                      />
                    ) : null}
                  </div>
                ) : (
                  <div className={'sd-upload-picture-card'}>
                    <div className={'sd-upload-picture-card-text'}>
                      <IconPlus />
                      <div className={'sd:mt-2.5 sd:font-semibold'}>{'上传'}</div>
                    </div>
                  </div>
                )}
              </div>
            </>
          }
        />
      </Space>
    </>
  );
}
