/** @jsxImportSource react */
import { Button, Result, Space } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Result
        status={'404'}
        subtitle={'抱歉，页面不存在。'}
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
