/** @jsxImportSource react */
import { Slider } from '@sdata/web-react';

export default function Example() {
  const marks = {
    0: '0km',
    5: '5km',
    10: '10km',
    15: '15km',
  };

  return (
    <>
      <Slider defaultValue={5} className={'sd:w-75'} max={15} marks={marks} />
    </>
  );
}
