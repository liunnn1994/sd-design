/** @jsxImportSource react */
import { Button, Popover, Space } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space>
        <Popover
          title={'标题'}
          content={
            <>
              <p>{'这里是文本内容'}</p>
              <p>{'这里是文本内容'}</p>
            </>
          }
        >
          <Button>{'悬停此处'}</Button>
        </Popover>
        <Popover
          title={'标题'}
          trigger={'click'}
          content={
            <>
              <p>{'这里是文本内容'}</p>
              <p>{'这里是文本内容'}</p>
            </>
          }
        >
          <Button>{'点击我'}</Button>
        </Popover>
      </Space>
    </>
  );
}
