/** @jsxImportSource react */
import { TimePicker } from '@sdata/web-react';
import { type ComponentProps, useState } from 'react';

export default function Example() {
  const [defaultValue, setDefaultValue] =
    useState<NonNullable<ComponentProps<typeof TimePicker>['defaultValue']>>('09:24');

  return (
    <>
      <TimePicker format={'HH:mm'} defaultValue={defaultValue} className={'sd:w-32.5'} />
    </>
  );
}
