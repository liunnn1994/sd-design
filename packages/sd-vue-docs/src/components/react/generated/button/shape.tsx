import { Button, Space } from '@sdata/web-react';
/** @jsxImportSource react */
import { IconPlus } from '@sdata/web-react/icon';

export default function Example() {
  return (
    <>
      <Space>
        <Button type={'primary'}>{'方形'}</Button>
        <Button type={'primary'} shape={'round'}>
          {'圆角'}
        </Button>
        <Button
          type={'primary'}
          icon={
            <>
              <IconPlus />
            </>
          }
        />
        <Button type={'primary'} shape={'circle'}>
          <IconPlus />
        </Button>
      </Space>
    </>
  );
}
