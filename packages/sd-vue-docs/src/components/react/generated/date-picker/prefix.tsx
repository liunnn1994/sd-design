import { DatePicker, RangePicker } from '@sdata/web-react';
/** @jsxImportSource react */
import { IconInfoCircle } from '@sdata/web-react/icon';

export default function Example() {
  function onSelect(dateString: unknown, date: unknown) {
    console.log('onSelect', dateString, date);
  }
  function onChange(dateString: unknown, date: unknown) {
    console.log('onChange: ', dateString, date);
  }

  return (
    <>
      <div>
        <div className={'sd:w-75'}>
          <DatePicker
            prefix={
              <>
                <IconInfoCircle />
              </>
            }
          />
        </div>
        <div className={'sd:mt-5 sd:w-100'}>
          <RangePicker
            showTime={true}
            defaultValue={['2019-08-08 00:00:00', '2019-08-18 00:00:00']}
            onSelect={onSelect}
            onChange={onChange}
            prefix={
              <>
                <IconInfoCircle />
              </>
            }
          />
        </div>
      </div>
    </>
  );
}
