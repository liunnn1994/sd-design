/** @jsxImportSource react */
import { BackTop } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <div className={'sd:relative'}>
        <ul id={'basic-demo'} className={'sd:h-50 sd:overflow-y-auto'}>
          {Array(40).map((_, index) => (
            <li key={index} className={'sd:leading-7.5'}>
              {'这里是正文内容'}
            </li>
          ))}
        </ul>
        <BackTop targetContainer={'#basic-demo'} className={'sd:absolute!'} />
      </div>
    </>
  );
}
