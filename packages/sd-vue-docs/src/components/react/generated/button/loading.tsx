import { Button, Space } from '@sdata/web-react';
/** @jsxImportSource react */
import { IconPlus } from '@sdata/web-react/icon';
import { useState } from 'react';

export default function Example() {
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);
  function handleClick1() {
    setLoading1(!loading1);
  }
  function handleClick2() {
    setLoading2(!loading2);
  }

  return (
    <>
      <Space>
        <Button type={'primary'} loading={true}>
          {'主要'}
        </Button>
        <Button loading={true}>{'默认'}</Button>
        <Button type={'dashed'} loading={true}>
          {'虚线'}
        </Button>
        <Button type={'primary'} loading={loading1} onClick={handleClick1}>
          {'点击我'}
        </Button>
        <Button
          type={'primary'}
          loading={loading2}
          onClick={handleClick2}
          icon={
            <>
              <IconPlus />
            </>
          }
        >
          {' 点击我 '}
        </Button>
      </Space>
    </>
  );
}
