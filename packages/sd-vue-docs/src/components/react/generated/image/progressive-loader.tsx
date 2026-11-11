/** @jsxImportSource react */
import { Button, Image } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [timestamp, setTimestamp] = useState(Date.now());

  return (
    <>
      <div>
        <Button
          type={'primary'}
          onClick={() => {
            setTimestamp(Date.now());
          }}
          className={'sd:mb-5'}
        >
          {' 重新加载 '}
        </Button>
      </div>
      <Image
        width={'200'}
        height={'200'}
        src={`https://picsum.photos/id/10/1000/1000?t=image-demo-timestamp-17-${timestamp}`}
        loader={
          <>
            <img
              alt={''}
              width={'200'}
              src={'https://picsum.photos/id/10/1000/1000?t=image-demo-17'}
              className={'sd:blur-[5px]'}
            />
          </>
        }
      />
    </>
  );
}
