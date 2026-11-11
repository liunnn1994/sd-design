import { Spin } from '@sdata/web-react';
/** @jsxImportSource react */
import { IconSync } from '@sdata/web-react/icon';

export default function Example() {
  return (
    <>
      <Spin
        icon={
          <>
            <IconSync />
          </>
        }
      />
    </>
  );
}
