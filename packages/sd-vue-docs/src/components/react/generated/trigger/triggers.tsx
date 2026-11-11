/** @jsxImportSource react */
import { Empty, Input, Trigger } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Trigger
        data-v-02d3a10d=""
        trigger={['click', 'hover', 'focus']}
        content={
          <>
            <div data-v-02d3a10d="" className={'demo-trigger'}>
              <Empty data-v-02d3a10d="" />
            </div>
          </>
        }
      >
        <Input data-v-02d3a10d="" placeholder={'点击、悬停或聚焦此处'} />
      </Trigger>
      <style>
        {
          '\n.demo-trigger[data-v-02d3a10d] {\n    width: 200px;\n    padding: 10px;\n    background-color: var(--sd-color-bg-popup);\n    border-radius: 4px;\n    box-shadow: 0 2px 8px 0 rgb(0 0 0 / 15%);\n}\n'
        }
      </style>
    </>
  );
}
