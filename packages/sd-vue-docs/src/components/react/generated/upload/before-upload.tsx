/** @jsxImportSource react */
import { Modal } from '@sdata/web-react';
import { Space, Upload } from '@sdata/web-react';

export default function Example() {
  const beforeUpload = (file: File) => {
    return new Promise<boolean>((resolve, reject) => {
      Modal.confirm({
        title: 'beforeUpload',
        content: `确认上传 ${file.name}`,
        onOk: () => resolve(true),
        onCancel: () => reject('cancel'),
      });
    });
  };

  return (
    <>
      <Space direction={'vertical'} className={'sd:w-full'}>
        <Upload action={'/'} onBeforeUpload={beforeUpload} />
      </Space>
    </>
  );
}
