/** @jsxImportSource react */
import { Progress } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <div className={'sd:w-[50%] sd:grid sd:gap-4'}>
        <Progress steps={3} percent={0.3} />
        <Progress steps={5} status={'warning'} percent={1} />
        <Progress steps={3} size={'small'} percent={0.3} />
      </div>
    </>
  );
}
