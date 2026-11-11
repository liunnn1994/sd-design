/** @jsxImportSource react */
import { DatePicker, RangePicker } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <div className={'sd:w-50 sd:mb-5'}>
        <DatePicker extra={<>{'自定义页脚'}</>} />
      </div>
      <div className={'sd:w-90'}>
        <RangePicker showTime={true} extra={<>{'自定义页脚'}</>} />
      </div>
    </>
  );
}
