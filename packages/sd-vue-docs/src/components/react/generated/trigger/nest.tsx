/** @jsxImportSource react */
import { Button, Empty, Trigger } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Trigger
        data-v-9e6ad0d4=""
        trigger={'click'}
        content={
          <>
            <div data-v-9e6ad0d4="" className={'trigger-demo-nest'}>
              <Empty data-v-9e6ad0d4="" />
              <Trigger
                data-v-9e6ad0d4=""
                position={'right'}
                content={
                  <>
                    <div data-v-9e6ad0d4="" className={'trigger-demo-nest'}>
                      <Empty data-v-9e6ad0d4="" />
                      <Trigger
                        data-v-9e6ad0d4=""
                        trigger={'click'}
                        position={'right'}
                        content={
                          <>
                            <div data-v-9e6ad0d4="" className={'trigger-demo-nest'}>
                              <Empty data-v-9e6ad0d4="" />
                              <Trigger
                                data-v-9e6ad0d4=""
                                position={'right'}
                                content={
                                  <>
                                    <Empty data-v-9e6ad0d4="" className={'trigger-demo-nest'} />
                                  </>
                                }
                              >
                                <Button data-v-9e6ad0d4="">{'悬停此处'}</Button>
                              </Trigger>
                            </div>
                          </>
                        }
                      >
                        <Button data-v-9e6ad0d4="">{'点击我'}</Button>
                      </Trigger>
                    </div>
                  </>
                }
              >
                <Button data-v-9e6ad0d4="">{'悬停此处'}</Button>
              </Trigger>
            </div>
          </>
        }
      >
        <Button data-v-9e6ad0d4="">{'点击我'}</Button>
      </Trigger>
      <style>
        {
          '\n.trigger-demo-nest[data-v-9e6ad0d4] {\n    width: 200px;\n    padding: 10px;\n    background-color: var(--sd-color-bg-popup);\n    border-radius: 4px;\n    box-shadow: 0 2px 8px 0 rgb(0 0 0 / 15%);\n}\n.trigger-demo-nest-popup-content[data-v-9e6ad0d4] {\n    text-align: right;\n}\n'
        }
      </style>
    </>
  );
}
