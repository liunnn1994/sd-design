/** @jsxImportSource react */
import { TimePicker } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <TimePicker defaultValue={'18:24:23'} className={'sd:mb-6 sd:mr-6 sd:w-[194px]'} />
      <TimePicker
        type={'time-range'}
        defaultValue={['09:24:53', '18:44:33']}
        className={'sd:w-63 sd:mb-6'}
      />
    </>
  );
}
