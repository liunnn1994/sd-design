import { Watermark } from '@sdata/web-react';
/** @jsxImportSource react */
import dayjs from 'dayjs';

export default function Example() {
  return (
    <>
      <Watermark content={['sd.design', dayjs().format('YYYY-MM-DD')]}>
        <div className={'sd:w-full sd:h-75'} />
      </Watermark>
    </>
  );
}
