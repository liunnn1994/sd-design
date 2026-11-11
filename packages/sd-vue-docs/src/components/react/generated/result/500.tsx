/** @jsxImportSource react */
import { Button, Result, Space } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Result
        status={'500'}
        subtitle={'页面暂时无法使用。'}
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
