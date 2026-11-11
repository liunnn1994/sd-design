/** @jsxImportSource react */
import { Button, Result, Space } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Result
        status={'success'}
        title={'这里是标题内容'}
        subtitle={<>{' 这里是副标题内容 '}</>}
        extra={
          <>
            <Space>
              <Button type={'primary'}>{'返回'}</Button>
            </Space>
          </>
        }
      />
    </>
  );
}
