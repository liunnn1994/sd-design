/** @jsxImportSource react */
import type { SliderFormatTooltip } from '@sdata/web-react';

import { Slider } from '@sdata/web-react';

export default function Example() {
  const formatter: SliderFormatTooltip = (value) => {
    return `${Math.round((value / 50) * 100)}%`;
  };

  return (
    <>
      <Slider min={0} max={50} className={'sd:w-50'} formatTooltip={formatter} />
    </>
  );
}
