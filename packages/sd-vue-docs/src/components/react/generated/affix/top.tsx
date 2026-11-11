/** @jsxImportSource react */
import { Affix, Button } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Affix offsetTop={80}>
        <Button type={'primary'}>{'距顶部 80px 时固定'}</Button>
      </Affix>
    </>
  );
}
