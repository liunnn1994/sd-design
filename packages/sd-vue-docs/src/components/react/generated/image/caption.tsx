/** @jsxImportSource react */
import { Image } from '@sdata/web-react';

export default function Example() {
  const src = 'https://picsum.photos/id/10/1000/1000?t=image-demo-3';
  const title = '用户头像';
  const description = '由 SD Design 提供';

  return (
    <>
      <Image width={'200px'} src={src} title={title} description={description} />
      <Image
        width={'200px'}
        src={src}
        title={title}
        description={description}
        footerPosition={'outer'}
        className={'sd:ml-4 sd:align-top'}
      />
    </>
  );
}
