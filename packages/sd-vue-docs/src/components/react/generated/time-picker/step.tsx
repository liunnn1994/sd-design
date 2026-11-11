/** @jsxImportSource react */
import { TimePicker } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <TimePicker
        defaultValue={'10:25:30'}
        step={{
          hour: 2,
          minute: 5,
          second: 10,
        }}
        className={'sd:w-48.5'}
      />
    </>
  );
}
