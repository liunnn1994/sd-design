/** @jsxImportSource react */
import type { FileItem } from '@sdata/web-react';

import { Modal } from '@sdata/web-react';
import { Space, Upload } from '@sdata/web-react';

export default function Example() {
  const beforeRemove = (file: FileItem) => {
    return new Promise<boolean>((resolve, reject) => {
      Modal.confirm({
        title: 'on-before-remove',
        content: `确认删除 ${file.name}`,
        onOk: () => resolve(true),
        onCancel: () => reject('cancel'),
      });
    });
  };

  return (
    <>
      <Space direction={'vertical'} className={'sd:w-full'}>
        <Upload
          action={'/'}
          defaultFileList={[
            {
              uid: '-2',
              name: 'light.png',
              url: '//picsum.photos/1000/1000',
            },
            {
              uid: '-1',
              name: 'ice.png',
              url: '//picsum.photos/1000/1000',
            },
          ]}
          onBeforeRemove={beforeRemove}
        />
      </Space>
    </>
  );
}
