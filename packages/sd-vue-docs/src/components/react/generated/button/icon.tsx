import { Button, Space } from '@sdata/web-react';
/** @jsxImportSource react */
import { IconPlus, IconDelete } from '@sdata/web-react/icon';

export default function Example() {
  return (
    <>
      <Space>
        <Button
          type={'primary'}
          icon={
            <>
              <IconPlus />
            </>
          }
        />
        <Button
          type={'primary'}
          icon={
            <>
              <IconDelete />
            </>
          }
        >
          {'删除'}
        </Button>
      </Space>
    </>
  );
}
