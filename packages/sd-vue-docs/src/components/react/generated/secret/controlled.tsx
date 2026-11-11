/** @jsxImportSource react */
import { Button, Secret, Space } from '@sdata/web-react';
import { useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Space direction={'vertical'} fill={true}>
        <Button
          type={'outline'}
          size={'small'}
          onClick={() => {
            setVisible(!visible);
          }}
        >
          {formatValue(visible ? '切换为隐藏' : '切换为显示')}
        </Button>
        <Secret
          visible={visible}
          onVisibleChange={(next) => setVisible(next as typeof visible)}
          text={'db-password-prod-2026'}
        />
      </Space>
    </>
  );
}
