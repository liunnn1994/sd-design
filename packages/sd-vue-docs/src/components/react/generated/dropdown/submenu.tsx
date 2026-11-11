/** @jsxImportSource react */
import { Button, Doption, Dropdown, Dsubmenu } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Dropdown
        content={
          <>
            <Doption>{'选项 1'}</Doption>
            <Dsubmenu
              value={'option-1'}
              content={
                <>
                  <Doption>{'选项 2-1'}</Doption>
                  <Dsubmenu
                    value={'option-2-2'}
                    trigger={'hover'}
                    content={
                      <>
                        <Doption>{'选项 2-1'}</Doption>
                        <Doption>{'选项 2-2'}</Doption>
                        <Doption>{'选项 2-3'}</Doption>
                      </>
                    }
                    footer={
                      <>
                        <div className={'sd:p-1.5 sd:text-center'}>
                          <Button>{'点击'}</Button>
                        </div>
                      </>
                    }
                  >
                    {'选项 2-2'}
                  </Dsubmenu>
                  <Doption>{'选项 2-3'}</Doption>
                </>
              }
            >
              {'选项 2'}
            </Dsubmenu>
            <Doption>{'选项 3'}</Doption>
          </>
        }
      >
        <Button>{'点击我'}</Button>
      </Dropdown>
    </>
  );
}
