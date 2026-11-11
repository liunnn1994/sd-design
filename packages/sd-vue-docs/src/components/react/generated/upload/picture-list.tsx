/** @jsxImportSource react */
import type { FileItem } from '@sdata/web-react';

import { Upload } from '@sdata/web-react';

export default function Example() {
  const fileList: FileItem[] = [
    {
      uid: '-2',
      name: '20200717-103937.png',
      url: '//picsum.photos/1000/1000',
    },
    {
      uid: '-1',
      name: 'hahhahahahaha.png',
      url: '//picsum.photos/1000/1000',
    },
  ];

  return (
    <>
      <Upload listType={'picture'} action={'/'} defaultFileList={fileList} />
    </>
  );
}
