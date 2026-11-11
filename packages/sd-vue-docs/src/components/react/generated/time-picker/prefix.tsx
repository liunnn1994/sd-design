import { TimePicker } from '@sdata/web-react';
/** @jsxImportSource react */
import { IconInfoCircle } from '@sdata/web-react/icon';

export default function Example() {
  return (
    <>
      <div>
        <div>
          <TimePicker
            className={'sd:w-48.5'}
            prefix={
              <>
                <IconInfoCircle />
              </>
            }
          />
        </div>
        <div>
          <TimePicker
            type={'time-range'}
            className={'sd:w-63 sd:mt-5'}
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
