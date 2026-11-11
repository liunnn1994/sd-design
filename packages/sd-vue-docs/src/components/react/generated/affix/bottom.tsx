/** @jsxImportSource react */
import { Affix, Button } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Affix offsetBottom={120}>
        <Button type={'primary'}>{'距底部 120px 时固定'}</Button>
      </Affix>
    </>
  );
}
