/** @jsxImportSource react */
import { TimePicker } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <TimePicker
        use12Hours={true}
        defaultValue={'12:20:20 AM'}
        format={'hh:mm:ss A'}
        className={'sd:w-48.5 sd:mr-6 sd:mb-6'}
      />
      <TimePicker
        use12Hours={true}
        defaultValue={'09:20:20 pm'}
        format={'hh:mm:ss a'}
        className={'sd:w-48.5 sd:mr-6 sd:mb-6'}
      />
      <TimePicker
        use12Hours={true}
        defaultValue={'2:20 AM'}
        format={'h:mm A'}
        className={'sd:w-48.5 sd:mr-6 sd:mb-6'}
      />
      <TimePicker
        type={'time-range'}
        use12Hours={true}
        defaultValue={['12:20:20 AM', '08:30:30 PM']}
        format={'hh:mm:ss A'}
        className={'sd:w-75 sd:mr-6 sd:mb-6'}
      />
    </>
  );
}
