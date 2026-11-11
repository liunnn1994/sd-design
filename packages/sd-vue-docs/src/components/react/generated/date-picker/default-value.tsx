/** @jsxImportSource react */
import type { FormatFunc } from '@sdata/web-react';

import { DatePicker, MonthPicker, RangePicker, WeekPicker, YearPicker } from '@sdata/web-react';
import dayjs from 'dayjs';

export default function Example() {
  function onSelect(dateString: unknown, date: unknown) {
    console.log('onSelect', dateString, date);
  }
  function onChange(dateString: unknown, date: unknown) {
    console.log('onChange: ', dateString, date);
  }
  const formatDate: FormatFunc = (value) => `custom format: ${dayjs(value).format('YYYY-MM-DD')}`;

  return (
    <>
      <div className={'sd:w-50 sd:mr-6 sd:mb-6'}>
        <DatePicker defaultValue={'2019-06-03'} onSelect={onSelect} onChange={onChange} />
      </div>
      <div className={'sd:w-60 sd:mr-6 sd:mb-6'}>
        <DatePicker
          defaultValue={'2019-06-03'}
          format={formatDate}
          onSelect={onSelect}
          onChange={onChange}
        />
      </div>
      <div className={'sd:w-50 sd:mr-6 sd:mb-6'}>
        <DatePicker
          showTime={true}
          defaultValue={'2019-06-03 08:00:00'}
          onSelect={onSelect}
          onChange={onChange}
        />
      </div>
      <div className={'sd:w-50 sd:mr-6 sd:mb-6'}>
        <YearPicker defaultValue={'2019'} onSelect={onSelect} onChange={onChange} />
      </div>
      <div className={'sd:w-50 sd:mr-6 sd:mb-6'}>
        <MonthPicker defaultValue={'2019-06'} onSelect={onSelect} onChange={onChange} />
      </div>
      <div className={'sd:w-50 sd:mr-6 sd:mb-6'}>
        <WeekPicker
          defaultValue={dayjs('2019-08-02').toDate()}
          onSelect={onSelect}
          onChange={onChange}
        />
      </div>
      <div className={'sd:w-90 sd:mr-6 sd:mb-6'}>
        <RangePicker
          showTime={true}
          defaultValue={['2019-08-08 00:00:00', '2019-08-18 00:00:00']}
          onSelect={onSelect}
          onChange={onChange}
        />
      </div>
      <div className={'sd:w-75 sd:mb-6'}>
        <RangePicker
          mode={'month'}
          defaultValue={['2019-08', '2020-06']}
          onSelect={onSelect}
          onChange={onChange}
        />
      </div>
    </>
  );
}
