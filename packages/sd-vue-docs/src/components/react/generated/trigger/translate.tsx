/** @jsxImportSource react */
import { Button, Empty, Space, Trigger } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space data-v-a1695fff="">
        <Trigger
          data-v-a1695fff=""
          content={
            <>
              <div data-v-a1695fff="" className={'trigger-demo-translate'}>
                <Empty data-v-a1695fff="" />
              </div>
            </>
          }
        >
          <Button data-v-a1695fff="">{'下方'}</Button>
        </Trigger>
        <Trigger
          data-v-a1695fff=""
          popupTranslate={[100, 20]}
          content={
            <>
              <div data-v-a1695fff="" className={'trigger-demo-translate'}>
                <Empty data-v-a1695fff="" />
              </div>
            </>
          }
        >
          <Button data-v-a1695fff="">{'下方偏移 [100, 20]'}</Button>
        </Trigger>
        <Trigger
          data-v-a1695fff=""
          popupTranslate={[-100, 20]}
          content={
            <>
              <div data-v-a1695fff="" className={'trigger-demo-translate'}>
                <Empty data-v-a1695fff="" />
              </div>
            </>
          }
        >
          <Button data-v-a1695fff="">{'下方偏移 [-100, 20]'}</Button>
        </Trigger>
      </Space>
      <style>
        {
          '\n.trigger-demo-translate[data-v-a1695fff] {\n    width: 200px;\n    padding: 10px;\n    background-color: var(--sd-color-bg-popup);\n    border-radius: 4px;\n    box-shadow: 0 2px 8px 0 rgb(0 0 0 / 15%);\n}\n'
        }
      </style>
    </>
  );
}
