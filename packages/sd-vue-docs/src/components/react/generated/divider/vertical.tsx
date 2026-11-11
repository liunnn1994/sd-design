/** @jsxImportSource react */
import { Divider } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <div
        className={
          'sd:box-border sd:w-140 sd:border-30 sd:border-solid sd:border-[rgb(var(--gray-2))] sd:p-6'
        }
      >
        <span>{'项目 1'}</span>
        <Divider direction={'vertical'} />
        <span>{'项目 2'}</span>
        <Divider direction={'vertical'} />
        <span>{'项目 3'}</span>
      </div>
    </>
  );
}
