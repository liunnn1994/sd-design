/** @jsxImportSource react */
import type { FileItem, FileStatus } from '@sdata/web-react';

import { Upload } from '@sdata/web-react';

export default function Example() {
  const fileList: FileItem[] = [
    {
      uid: '-1',
      name: 'ice.png',
      url: '//picsum.photos/1000/1000',
    },
    {
      status: 'error' as FileStatus,
      uid: '-2',
      percent: 0,
      response: '上传错误提示',
      name: 'cat.png',
      url: '//picsum.photos/1000/1000',
    },
    {
      uid: '-3',
      name: 'light.png',
      url: '//picsum.photos/1000/1000',
    },
  ];

  return (
    <>
      <Upload action={'/'} defaultFileList={fileList} />
    </>
  );
}
