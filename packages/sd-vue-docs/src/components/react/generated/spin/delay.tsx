/** @jsxImportSource react */
import { Button, Card, Space, Spin } from '@sdata/web-react';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const [loading, setLoading] = useState(false);

  return (
    <>
      <Space direction={'vertical'}>
        <Button
          onClick={() => {
            setLoading(!loading);
          }}
        >
          {formatValue(loading ? '结束加载' : '开始加载')}
        </Button>
        <Spin loading={loading} delay={true} tip={'加载超过 400ms 后显示'}>
          <Card title={'延迟加载'}>
            {' 短于 400ms 的加载过程不会显示遮罩，可避免快速请求造成的闪烁。 '}
          </Card>
        </Spin>
      </Space>
    </>
  );
}
