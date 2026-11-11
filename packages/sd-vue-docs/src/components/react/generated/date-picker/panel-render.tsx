/** @jsxImportSource react */
import { DatePicker } from '@sdata/web-react';
import { createElement } from 'react';

export default function Example() {
  return (
    <>
      <DatePicker
        renderPanel={({ component, props }) => (
          <>
            <div className={'sd:border sd:rounded sd:p-2'}>
              <>{createElement(component, { ...props }, <></>)}</>
              <div className={'sd:text-center sd:text-xs sd:mt-1 sd:text-gray-400'}>
                {' 自定义面板容器 '}
              </div>
            </div>
          </>
        )}
      />
    </>
  );
}
