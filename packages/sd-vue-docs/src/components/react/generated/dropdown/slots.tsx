/** @jsxImportSource react */
import { Button, Doption, Dropdown } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Dropdown
        header={
          <>
            <div className={'sd:px-6 sd:py-2'}>{'常用操作'}</div>
          </>
        }
        content={
          <>
            <Doption>{'复制'}</Doption>
            <Doption>{'移动'}</Doption>
          </>
        }
        footer={
          <>
            <div className={'sd:px-6 sd:py-2'}>{'共 2 项'}</div>
          </>
        }
      >
        <Button>{'打开菜单'}</Button>
      </Dropdown>
    </>
  );
}
