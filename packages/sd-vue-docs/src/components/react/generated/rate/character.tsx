/** @jsxImportSource react */
import { Rate } from '@sdata/web-react';
import { IconCheck, IconClose } from '@sdata/web-react/icon';

export default function Example() {
  return (
    <>
      <Rate
        defaultValue={2}
        renderCharacter={(index) => <>{index < 3 ? <IconCheck /> : <IconClose />}</>}
      />
    </>
  );
}
