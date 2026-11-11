/** @jsxImportSource react */
import { Image, ImagePreviewGroup, Space } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <ImagePreviewGroup infinite={true}>
        <Space>
          <Image src={'https://picsum.photos/id/10/1200/480?t=image-demo-12'} width={'200'} />
          <Image src={'https://picsum.photos/id/10/1200/480?t=image-demo-13'} width={'200'} />
          <Image src={'https://picsum.photos/id/10/1200/480?t=image-demo-14'} width={'200'} />
          <Image src={'https://picsum.photos/id/10/1200/480?t=image-demo-15'} width={'200'} />
        </Space>
      </ImagePreviewGroup>
    </>
  );
}
