/** @jsxImportSource react */
import type { DisabledDate } from '@sdata/web-react';

import { DatePicker, RangePicker } from '@sdata/web-react';
import dayjs from 'dayjs';

export default function Example() {
  const disableBeforePresetDate: DisabledDate = (current) =>
    dayjs(current).isBefore(dayjs('2020-08-08'));

  return (
    <>
      <div className={'sd:w-50 sd:mb-5'}>
        <DatePicker defaultValue={'2020-08-08'} disabled={true} />
      </div>
      <div className={'sd:w-75 sd:mb-5'}>
        <RangePicker defaultValue={['2020-08-08', '2020-08-18']} disabled={true} />
      </div>
      <div className={'sd:mb-5 sd:w-75'}>
        <RangePicker
          defaultValue={['2020-08-08']}
          disabled={[true, false]}
          disabledDate={disableBeforePresetDate}
        />
      </div>
      <div className={'sd:w-95'}>
        <RangePicker
          showTime={true}
          defaultValue={['2020-08-08 02:02:02']}
          disabled={[true, false]}
        />
      </div>
    </>
  );
}
