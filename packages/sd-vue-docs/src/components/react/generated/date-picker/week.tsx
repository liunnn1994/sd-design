/** @jsxImportSource react */
import { WeekPicker } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <div className={'sd:w-50 sd:mr-6 sd:mb-6'}>
        <WeekPicker />
      </div>
      <div className={'sd:w-50 sd:mr-6 sd:mb-6'}>
        <WeekPicker dayStartOfWeek={1} />
      </div>
    </>
  );
}
