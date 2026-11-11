/** @jsxImportSource react */
import { Image, ImagePreviewAction } from '@sdata/web-react';
import { IconDownload } from '@sdata/web-react/icon';

export default function Example() {
  const download = () => {
    console.log('点击下载图片');
  };

  return (
    <>
      <Image
        width={'200'}
        src={'https://picsum.photos/id/10/1000/1000?t=image-demo-9'}
        previewProps={{
          actionsLayout: ['rotateRight', 'zoomIn', 'zoomOut'],
        }}
        previewActions={
          <>
            <ImagePreviewAction name={'下载'} onClick={download}>
              <IconDownload />
            </ImagePreviewAction>
          </>
        }
      />
    </>
  );
}
