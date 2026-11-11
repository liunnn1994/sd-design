/** @jsxImportSource react */
import { BackTop, Button } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <div className={'sd:relative'}>
        <ul id={'custom-demo'} className={'sd:h-50 sd:overflow-y-auto'}>
          {Array(40).map((_, index) => (
            <li key={index} className={'sd:leading-7.5'}>
              {' 这里是正文内容 '}
            </li>
          ))}
        </ul>
        <BackTop targetContainer={'#custom-demo'} className={'sd:absolute!'}>
          <Button>{'返回顶部'}</Button>
        </BackTop>
      </div>
    </>
  );
}
