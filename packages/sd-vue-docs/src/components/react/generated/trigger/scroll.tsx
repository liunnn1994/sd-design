/** @jsxImportSource react */
import { Button, Empty, Trigger } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <div data-v-ecdff735="" className={'sd:h-25 sd:overflow-y-scroll'}>
        <div data-v-ecdff735="" className={'sd:h-50'}>
          <Trigger
            data-v-ecdff735=""
            trigger={'click'}
            updateAtScroll={true}
            content={
              <>
                <div data-v-ecdff735="" className={'demo-basic'}>
                  <Empty data-v-ecdff735="" />
                </div>
              </>
            }
          >
            <Button data-v-ecdff735="" className={'sd:mt-20'}>
              {'点击我'}
            </Button>
          </Trigger>
        </div>
      </div>
      <style>
        {
          '\n.demo-basic[data-v-ecdff735] {\n    width: 200px;\n    padding: 10px;\n    background-color: var(--sd-color-bg-popup);\n    border-radius: 4px;\n    box-shadow: 0 2px 8px 0 rgb(0 0 0 / 15%);\n}\n'
        }
      </style>
    </>
  );
}
