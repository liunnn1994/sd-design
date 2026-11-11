/** @jsxImportSource react */
import { TimePicker } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <TimePicker disableConfirm={true} className={'sd:w-48.5 sd:mr-6 sd:mb-6'} />
      <TimePicker type={'time-range'} disableConfirm={true} className={'sd:w-63 sd:mr-6 sd:mb-6'} />
    </>
  );
}
