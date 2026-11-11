/** @jsxImportSource react */
import { DatePicker, Radio, RadioGroup } from '@sdata/web-react';
import { type ComponentProps, useState } from 'react';

export default function Example() {
  const [size, setSize] = useState<NonNullable<ComponentProps<typeof DatePicker>['size']>>('small');

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
      <div className={'sd:w-63.5'}>
        <DatePicker size={size} />
      </div>
    </>
  );
}
