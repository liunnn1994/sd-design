/** @jsxImportSource react */
import { Upload } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Upload multiple={true} action={'/'} limit={3} />
    </>
  );
}
