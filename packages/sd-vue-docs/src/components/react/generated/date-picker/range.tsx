/** @jsxImportSource react */
import { RangePicker } from '@sdata/web-react';

export default function Example() {
  function onSelect(dateString: unknown, date: unknown) {
    console.log('onSelect', dateString, date);
  }
  function onChange(dateString: unknown, date: unknown) {
    console.log('onChange: ', dateString, date);
  }

  return (
    <>
      <div className={'sd:w-63.5 sd:mb-5'}>
        <RangePicker onChange={onChange} onSelect={onSelect} />
      </div>
      <div className={'sd:w-63.5 sd:mb-5'}>
        <RangePicker mode={'week'} onChange={onChange} onSelect={onSelect} />
      </div>
      <div className={'sd:w-63.5 sd:mb-5'}>
        <RangePicker mode={'month'} onChange={onChange} onSelect={onSelect} />
      </div>
      <div className={'sd:w-63.5 sd:mb-5'}>
        <RangePicker mode={'year'} onChange={onChange} onSelect={onSelect} />
      </div>
      <div className={'sd:w-63.5 sd:mb-5'}>
        <RangePicker mode={'quarter'} onChange={onChange} onSelect={onSelect} />
      </div>
      <div className={'sd:w-95'}>
        <RangePicker
          showTime={true}
          timePickerProps={{
            defaultValue: ['00:00:00', '00:00:00'],
          }}
          onChange={onChange}
          onSelect={onSelect}
        />
      </div>
    </>
  );
}
