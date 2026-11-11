/** @jsxImportSource react */
import { Button, Dgroup, Doption, Dropdown } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Dropdown
        content={
          <>
            <Dgroup title={'分组 1'}>
              <Doption>{'选项 1'}</Doption>
              <Doption>{'选项 2'}</Doption>
              <Doption>{'选项 3'}</Doption>
            </Dgroup>
            <Dgroup title={'分组 2'}>
              <Doption>{'选项 4'}</Doption>
              <Doption>{'选项 5'}</Doption>
              <Doption>{'选项 6'}</Doption>
            </Dgroup>
          </>
        }
      >
        <Button>{'点击我'}</Button>
      </Dropdown>
    </>
  );
}
