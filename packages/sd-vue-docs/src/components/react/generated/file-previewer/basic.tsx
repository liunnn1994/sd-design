/** @jsxImportSource react */
import { Button, FilePreviewer } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Button
        className={'sd:mb-4'}
        type={'primary'}
        onClick={() => {
          setVisible(true);
        }}
      >
        {'预览图片'}
      </Button>
      <FilePreviewer
        visible={visible}
        onVisibleChange={(next) => setVisible(next as typeof visible)}
        title={'图片预览'}
        src={'https://picsum.photos/id/10/1000/1000?t=file-previewer-basic'}
      />
    </>
  );
}
