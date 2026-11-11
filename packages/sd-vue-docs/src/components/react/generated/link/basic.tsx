/** @jsxImportSource react */
import { Link, Space } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space>
        <Link href={'#'}>{'链接'}</Link>
        <Link href={'#'} disabled={true}>
          {'链接'}
        </Link>
      </Space>
    </>
  );
}
