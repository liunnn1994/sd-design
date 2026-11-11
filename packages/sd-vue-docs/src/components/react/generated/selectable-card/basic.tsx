/** @jsxImportSource react */
import { SelectableCard } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [selected, setSelected] = useState(false);

  return (
    <>
      <SelectableCard
        label={'标准版方案'}
        isSelected={selected}
        title={'标准版'}
        value={'¥99 / 月'}
        description={'适合小型团队协作'}
        width={'320px'}
        onChange={($event) => {
          setSelected($event);
        }}
      />
    </>
  );
}
