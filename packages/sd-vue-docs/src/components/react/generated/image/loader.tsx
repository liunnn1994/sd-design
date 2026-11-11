/** @jsxImportSource react */
import { Button, Image } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [timestamp, setTimestamp] = useState(Date.now());

  return (
    <>
      <div data-v-f2f28b8a="" className={'sd:mb-2'}>
        <Button
          data-v-f2f28b8a=""
          type={'primary'}
          onClick={() => {
            setTimestamp(Date.now());
          }}
        >
          {' 重新加载 '}
        </Button>
      </div>
      <Image
        data-v-f2f28b8a=""
        width={'200'}
        height={'200'}
        src={`https://picsum.photos/id/10/1000/1000?t=image-loader-default-${timestamp}`}
        showLoader={true}
      />
      <Image
        data-v-f2f28b8a=""
        width={'200'}
        height={'200'}
        src={`https://picsum.photos/id/10/1000/1000?t=image-loader-custom-${timestamp}`}
        className={'sd:ml-4'}
        loader={
          <>
            <div data-v-f2f28b8a="" className={'loader-animate'} />
          </>
        }
      />
      <style>
        {
          '\n.loader-animate[data-v-f2f28b8a] {\n    width: 100%;\n    height: 100%;\n    background: linear-gradient(\n      -60deg,\n      var(--color-fill-2) 25%,\n      var(--color-neutral-3) 40%,\n      var(--color-fill-3) 55%\n    );\n    background-size: 400% 100%;\n    animation: loop-circle-f2f28b8a 1.5s cubic-bezier(0.34, 0.69, 0.1, 1) infinite;\n}\n@keyframes loop-circle-f2f28b8a {\n0% {\n      background-position: 100% 50%;\n}\n100% {\n      background-position: 0 50%;\n}\n}\n'
        }
      </style>
    </>
  );
}
