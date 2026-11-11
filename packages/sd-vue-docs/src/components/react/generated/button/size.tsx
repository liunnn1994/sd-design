/** @jsxImportSource react */
import { Button, Space } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space>
        <Button type={'primary'} size={'mini'}>
          {'迷你'}
        </Button>
        <Button type={'primary'} size={'small'}>
          {'小'}
        </Button>
        <Button type={'primary'}>{'中'}</Button>
        <Button type={'primary'} size={'large'}>
          {'大'}
        </Button>
      </Space>
    </>
  );
}
