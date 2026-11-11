/** @jsxImportSource react */
import { Button, ImagePreviewGroup } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState(3);
  const onClick = () => {
    setVisible(true);
  };

  return (
    <>
      <Button type={'primary'} onClick={onClick}>
        {'点击预览多张图片'}
      </Button>
      <ImagePreviewGroup
        visible={visible}
        onVisibleChange={(next) => setVisible(next as typeof visible)}
        current={current}
        onCurrentChange={(next) => setCurrent(next as typeof current)}
        infinite={true}
        srcList={[
          'https://picsum.photos/id/10/1200/480?t=image-demo-4',
          'https://picsum.photos/id/10/1200/480?t=image-demo-5',
          'https://picsum.photos/id/10/1200/480?t=image-demo-6',
          'https://picsum.photos/id/10/1200/480?t=image-demo-7',
        ]}
      />
    </>
  );
}
