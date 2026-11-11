/** @jsxImportSource react */
import { Button, Empty, Input, Space, Trigger } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space data-v-8803c36b="">
        <Trigger
          data-v-8803c36b=""
          position={'top'}
          autoFitPosition={true}
          unmountOnClose={false}
          content={
            <>
              <div data-v-8803c36b="" className={'demo-basic'}>
                <Empty data-v-8803c36b="" />
              </div>
            </>
          }
        >
          <span data-v-8803c36b="">{'悬停此处'}</span>
        </Trigger>
        <Trigger
          data-v-8803c36b=""
          trigger={'click'}
          unmountOnClose={false}
          content={
            <>
              <div data-v-8803c36b="" className={'demo-basic'}>
                <Empty data-v-8803c36b="" />
              </div>
            </>
          }
        >
          <Button data-v-8803c36b="">{'点击我'}</Button>
        </Trigger>
        <Trigger
          data-v-8803c36b=""
          trigger={'focus'}
          content={
            <>
              <div data-v-8803c36b="" className={'demo-basic'}>
                <Empty data-v-8803c36b="" />
              </div>
            </>
          }
        >
          <Input data-v-8803c36b="" placeholder={'聚焦此处'} />
        </Trigger>
      </Space>
      <style>
        {
          '\n.demo-basic[data-v-8803c36b] {\n    width: 200px;\n    padding: 10px;\n    background-color: var(--sd-color-bg-popup);\n    border-radius: 4px;\n    box-shadow: 0 2px 8px 0 rgb(0 0 0 / 15%);\n}\n'
        }
      </style>
    </>
  );
}
