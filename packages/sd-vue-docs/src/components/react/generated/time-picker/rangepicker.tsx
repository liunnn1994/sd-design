/** @jsxImportSource react */
import { TimePicker } from '@sdata/web-react';

export default function Example() {
  function print(
    ...arg: [
      string,
      string | Array<string | undefined> | undefined,
      Date | Array<Date | undefined> | undefined,
    ]
  ) {
    console.log(...arg);
  }

  return (
    <>
      <TimePicker
        type={'time-range'}
        onSelect={(valueString, value) => print('onSelect:', valueString, value)}
        onChange={(valueString, value) => print('onChange:', valueString, value)}
        className={'sd:w-[252px]'}
      />
    </>
  );
}
