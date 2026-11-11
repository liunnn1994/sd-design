/** @jsxImportSource react */
import { Button, Doption, Dropdown, Space } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space>
        <Dropdown
          position={'bl'}
          content={
            <>
              <Doption>{'选项 1'}</Doption>
              <Doption>{'选项 2'}</Doption>
              <Doption>{'选项 3'}</Doption>
            </>
          }
        >
          <Button>{'左下'}</Button>
        </Dropdown>
        <Dropdown
          position={'bottom'}
          content={
            <>
              <Doption>{'选项 1'}</Doption>
              <Doption>{'选项 2'}</Doption>
              <Doption>{'选项 3'}</Doption>
            </>
          }
        >
          <Button>{'底部'}</Button>
        </Dropdown>
        <Dropdown
          position={'br'}
          content={
            <>
              <Doption>{'选项 1'}</Doption>
              <Doption>{'选项 2'}</Doption>
              <Doption>{'选项 3'}</Doption>
            </>
          }
        >
          <Button>{'右下'}</Button>
        </Dropdown>
        <Dropdown
          position={'tl'}
          content={
            <>
              <Doption>{'选项 1'}</Doption>
              <Doption>{'选项 2'}</Doption>
              <Doption>{'选项 3'}</Doption>
            </>
          }
        >
          <Button>{'左上'}</Button>
        </Dropdown>
        <Dropdown
          position={'top'}
          content={
            <>
              <Doption>{'选项 1'}</Doption>
              <Doption>{'选项 2'}</Doption>
              <Doption>{'选项 3'}</Doption>
            </>
          }
        >
          <Button>{'顶部'}</Button>
        </Dropdown>
        <Dropdown
          position={'tr'}
          content={
            <>
              <Doption>{'选项 1'}</Doption>
              <Doption>{'选项 2'}</Doption>
              <Doption>{'选项 3'}</Doption>
            </>
          }
        >
          <Button>{'右上'}</Button>
        </Dropdown>
      </Space>
    </>
  );
}
