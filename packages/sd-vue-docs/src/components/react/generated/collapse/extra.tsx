/** @jsxImportSource react */
import { Message } from '@sdata/web-react';
import { Button, Collapse, CollapseItem, Tag } from '@sdata/web-react';
import { IconCopy } from '@sdata/web-react/icon';

export default function Example() {
  const sayHello = () => {
    Message.info('hello');
  };

  return (
    <>
      <Collapse>
        <CollapseItem
          header={'示例数据有限公司'}
          key={'1'}
          extra={
            <>
              <IconCopy />
            </>
          }
        >
          <div>{'示例数据有限公司'}</div>
          <div>{'示例数据有限公司'}</div>
        </CollapseItem>
        <CollapseItem
          header={'示例数据有限公司'}
          key={2}
          extra={
            <>
              <Button
                type={'primary'}
                size={'mini'}
                onClick={(event) => {
                  event.stopPropagation();
                  sayHello();
                }}
              >
                {'你好'}
              </Button>
            </>
          }
        >
          <div>{'示例数据有限公司'}</div>
          <div>{'示例数据有限公司'}</div>
        </CollapseItem>
        <CollapseItem
          header={'示例数据有限公司'}
          key={'3'}
          extra={
            <>
              <Tag size={'small'}>{'城市'}</Tag>
            </>
          }
        >
          <div>{'示例数据有限公司'}</div>
          <div>{'示例数据有限公司'}</div>
        </CollapseItem>
      </Collapse>
    </>
  );
}
