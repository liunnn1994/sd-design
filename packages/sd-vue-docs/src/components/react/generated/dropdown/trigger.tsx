/** @jsxImportSource react */
import { Button, Doption, Dropdown, Space } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space size={'large'}>
        <Dropdown
          content={
            <>
              <Doption>{'选项 1'}</Doption>
              <Doption>{'选项 2'}</Doption>
              <Doption>{'选项 3'}</Doption>
            </>
          }
        >
          <Button>{'点击我'}</Button>
        </Dropdown>
        <Dropdown
          trigger={'hover'}
          content={
            <>
              <Doption>{'选项 1'}</Doption>
              <Doption>{'选项 2'}</Doption>
              <Doption>{'选项 3'}</Doption>
            </>
          }
        >
          <Button>{'悬停此处'}</Button>
        </Dropdown>
      </Space>
    </>
  );
}
