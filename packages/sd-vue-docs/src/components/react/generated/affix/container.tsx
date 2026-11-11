/** @jsxImportSource react */
import { Affix, Button } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);

  return (
    <>
      <div className={'sd:h-50 sd:overflow-auto'} ref={setContainerRef}>
        <div className={'sd:h-100 sd:overflow-hidden sd:bg-[#ccc]'}>
          <Affix offsetTop={20} target={containerRef ?? undefined} className={'sd:m-10'}>
            <Button type={'primary'}>{'滚动容器内固定'}</Button>
          </Affix>
        </div>
      </div>
    </>
  );
}
