import { Button, Result, Space } from '@sdata/web-react';
/** @jsxImportSource react */
import { IconFaceSmileFill } from '@sdata/web-react/icon';

export default function Example() {
  return (
    <>
      <Result
        status={null}
        title={'这里是标题内容'}
        subtitle={'这里是副标题内容'}
        icon={
          <>
            <IconFaceSmileFill />
          </>
        }
        extra={
          <>
            <Space>
              <Button type={'secondary'}>{'重试'}</Button>
              <Button type={'primary'}>{'返回'}</Button>
            </Space>
          </>
        }
      />
    </>
  );
}
