/** @jsxImportSource react */
import { Watermark } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Watermark content={'SD Design'} grayscale={true} image={''}>
        <div className={'sd:w-full sd:h-75'} />
      </Watermark>
    </>
  );
}
