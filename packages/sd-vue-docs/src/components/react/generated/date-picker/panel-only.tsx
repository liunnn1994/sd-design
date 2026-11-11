/** @jsxImportSource react */
import type { CalendarValue } from '@sdata/web-react';

import { DatePicker, RangePicker } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [pickerValue, setPickerValue] = useState<CalendarValue | undefined>(undefined);
  const [rangePickerValue, setRangePickerValue] = useState<CalendarValue[] | undefined>(undefined);

  return (
    <>
      <div>
        <div className={'sd:w-67'}>
          <DatePicker
            defaultValue={'2019-06-03'}
            pickerValue={pickerValue}
            onPickerValueChange={(next) => setPickerValue(next as typeof pickerValue)}
            hideTrigger={true}
          />
        </div>
        <div className={'sd:w-140 sd:mt-5'}>
          <RangePicker
            defaultValue={['2019-08-01', '2020-06-01']}
            pickerValue={rangePickerValue}
            onPickerValueChange={(next) => setRangePickerValue(next as typeof rangePickerValue)}
            hideTrigger={true}
          />
        </div>
      </div>
    </>
  );
}
