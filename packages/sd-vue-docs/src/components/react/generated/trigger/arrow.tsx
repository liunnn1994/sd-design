/** @jsxImportSource react */
import { Button, Empty, Space, Trigger } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space data-v-20156da1="">
        <Trigger
          data-v-20156da1=""
          trigger={'click'}
          content={
            <>
              <div data-v-20156da1="" className={'demo-arrow'}>
                <Empty data-v-20156da1="" />
              </div>
            </>
          }
        >
          <Button data-v-20156da1="">{'点击我'}</Button>
        </Trigger>
        <Trigger
          data-v-20156da1=""
          trigger={'click'}
          showArrow={true}
          content={
            <>
              <div data-v-20156da1="" className={'demo-arrow'}>
                <Empty data-v-20156da1="" />
              </div>
            </>
          }
        >
          <Button data-v-20156da1="">{'点击我（带箭头）'}</Button>
        </Trigger>
      </Space>
      <style>
        {
          '\n.demo-arrow[data-v-20156da1] {\n    width: 200px;\n    padding: 10px;\n    background-color: var(--sd-color-bg-popup);\n    border-radius: 4px;\n    box-shadow: 0 2px 8px 0 rgb(0 0 0 / 15%);\n}\n'
        }
      </style>
    </>
  );
}
