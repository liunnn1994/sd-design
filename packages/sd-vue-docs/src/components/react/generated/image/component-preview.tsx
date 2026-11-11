/** @jsxImportSource react */
import { Button, ImagePreview } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [visible, setVisible] = useState(false);
  const onClick = () => {
    setVisible(true);
  };

  return (
    <>
      <Button type={'primary'} onClick={onClick}>
        {'点击预览图片'}
      </Button>
      <ImagePreview
        src={'https://picsum.photos/id/10/1000/1000?t=image-demo-8'}
        visible={visible}
        onVisibleChange={(next) => setVisible(next as typeof visible)}
      />
    </>
  );
}
