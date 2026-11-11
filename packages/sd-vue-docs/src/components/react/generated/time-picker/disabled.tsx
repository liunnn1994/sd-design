/** @jsxImportSource react */
import { TimePicker } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <TimePicker disabled={true} className={'sd:mr-6 sd:mb-6'} />
      <TimePicker type={'time-range'} disabled={true} className={'sd:w-63 sd:mr-6 sd:mb-6'} />
    </>
  );
}
