/** @jsxImportSource react */
import { Button, Result, Space } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Result
        status={'403'}
        subtitle={'您没有权限访问此资源。'}
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
