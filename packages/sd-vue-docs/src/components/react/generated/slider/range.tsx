/** @jsxImportSource react */
import type { SliderValue } from '@sdata/web-react';

import { Slider } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [value, setValue] = useState<SliderValue>([5, 10]);

  return (
    <>
      <Slider
        value={value}
        onValueChange={(next) => setValue(next as typeof value)}
        className={'sd:w-75'}
        range={true}
      />
    </>
  );
}
