/** @jsxImportSource react */
import { Doption, Dropdown } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Dropdown
        trigger={'contextMenu'}
        alignPoint={true}
        className={'sd:block'}
        content={
          <>
            <Doption>{'选项 1'}</Doption>
            <Doption>{'选项 2'}</Doption>
            <Doption>{'选项 3'}</Doption>
          </>
        }
      >
        <div
          className={
            'sd:flex sd:h-[300px] sd:items-center sd:justify-center sd:bg-[var(--color-fill-2)]'
          }
        >
          <div>{'点击我'}</div>
        </div>
      </Dropdown>
    </>
  );
}
