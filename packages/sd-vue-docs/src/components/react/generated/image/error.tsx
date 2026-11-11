/** @jsxImportSource react */
import { Image, Space } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space size={20}>
        <Image width={'400'} height={'300'} src={'some-error.png'} />
        <Image
          width={'400'}
          height={'300'}
          src={'some-error.png'}
          alt={'画面中的人正在开心地吃着冰淇淋。冰淇淋呈绿色，似乎是抹茶口味。人物留着棕色长发。'}
        />
      </Space>
    </>
  );
}
