/** @jsxImportSource react */
import type { Size } from '@sdata/web-react';

import { Radio, RadioGroup, TimePicker } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [size, setSize] = useState<Size>('small');

  return (
    <>
      <div className={'sd:mb-5'}>
        <RadioGroup
          value={size}
          onValueChange={(next) => setSize(next as typeof size)}
          type={'button'}
        >
          <Radio value={'mini'}>{'迷你'}</Radio>
          <Radio value={'small'}>{'小'}</Radio>
          <Radio value={'medium'}>{'中'}</Radio>
          <Radio value={'large'}>{'大'}</Radio>
        </RadioGroup>
      </div>
      <TimePicker className={'sd:w-48.5'} size={size} />
    </>
  );
}
