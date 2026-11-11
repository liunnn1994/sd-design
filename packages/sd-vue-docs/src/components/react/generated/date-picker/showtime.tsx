/** @jsxImportSource react */
import { DatePicker, RangePicker } from '@sdata/web-react';

export default function Example() {
  function onSelect(dateString: unknown, date: unknown) {
    console.log('onSelect', dateString, date);
  }
  function onChange(dateString: unknown, date: unknown) {
    console.log('onChange: ', dateString, date);
  }
  function onOk(dateString: unknown, date: unknown) {
    console.log('onOk: ', dateString, date);
  }

  return (
    <>
      <div className={'sd:w-55 sd:mr-6 sd:mb-6'}>
        <DatePicker
          showTime={true}
          timePickerProps={{ defaultValue: '09:09:06' }}
          format={'YYYY-MM-DD HH:mm:ss'}
          onChange={onChange}
          onSelect={onSelect}
          onOk={onOk}
        />
      </div>
      <div className={'sd:w-55 sd:mr-6 sd:mb-6'}>
        <DatePicker
          showTime={true}
          format={'YYYY-MM-DD hh:mm'}
          onChange={onChange}
          onSelect={onSelect}
          onOk={onOk}
        />
      </div>
      <div className={'sd:w-90 sd:mr-6 sd:mb-6'}>
        <RangePicker
          showTime={true}
          timePickerProps={{ defaultValue: ['00:00:00', '09:09:06'] }}
          format={'YYYY-MM-DD HH:mm'}
          onChange={onChange}
          onSelect={onSelect}
          onOk={onOk}
        />
      </div>
    </>
  );
}
