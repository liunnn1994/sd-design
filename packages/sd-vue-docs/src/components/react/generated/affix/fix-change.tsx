/** @jsxImportSource react */
import { Affix, Button } from '@sdata/web-react';

export default function Example() {
  const onChange = (fixed: boolean) => {
    console.log(`${fixed}`);
  };

  return (
    <>
      <Affix offsetBottom={80} onChange={onChange}>
        <Button type={'primary'}>{'距底部 80px 时固定'}</Button>
      </Affix>
    </>
  );
}
