/** @jsxImportSource react */
import type { TimeValue } from '@sdata/web-react';

import { TimePicker } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [value, setValue] = useState<TimeValue | undefined | undefined>(undefined);

  return (
    <>
      <TimePicker
        className={'sd:w-48.5'}
        value={value}
        onValueChange={(next) => setValue(next as typeof value)}
      />
    </>
  );
}
