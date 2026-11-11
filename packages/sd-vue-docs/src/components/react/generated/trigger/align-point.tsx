/** @jsxImportSource react */
import { Empty, Trigger } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Trigger
        data-v-6a65a150=""
        trigger={'click'}
        alignPoint={true}
        content={
          <>
            <div data-v-6a65a150="" className={'demo-point'}>
              <Empty data-v-6a65a150="" />
            </div>
          </>
        }
      >
        <div data-v-6a65a150="" className={'demo-point-trigger'}>
          <div data-v-6a65a150="">{'点击我'}</div>
        </div>
      </Trigger>
      <style>
        {
          '\n.demo-point-trigger[data-v-6a65a150] {\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    height: 300px;\n    background-color: var(--sd-color-fill-2);\n}\n.demo-point[data-v-6a65a150] {\n    width: 200px;\n    padding: 10px;\n    background-color: var(--sd-color-bg-popup);\n    border-radius: 4px;\n    box-shadow: 0 2px 8px 0 rgb(0 0 0 / 15%);\n}\n.demo-point-wrapper[data-v-6a65a150] {\n    display: block;\n}\n'
        }
      </style>
    </>
  );
}
