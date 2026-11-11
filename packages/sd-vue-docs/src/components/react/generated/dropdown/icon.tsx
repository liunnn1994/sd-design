/** @jsxImportSource react */
import { Button, Doption, Dropdown } from '@sdata/web-react';
import { IconLocation } from '@sdata/web-react/icon';

export default function Example() {
  return (
    <>
      <Dropdown
        content={
          <>
            <Doption
              icon={
                <>
                  <IconLocation />
                </>
              }
            >
              {'选项 1'}
            </Doption>
            <Doption
              icon={
                <>
                  <IconLocation />
                </>
              }
            >
              {'选项 2'}
            </Doption>
            <Doption
              icon={
                <>
                  <IconLocation />
                </>
              }
            >
              {'选项 3'}
            </Doption>
          </>
        }
      >
        <Button>{'点击我'}</Button>
      </Dropdown>
    </>
  );
}
