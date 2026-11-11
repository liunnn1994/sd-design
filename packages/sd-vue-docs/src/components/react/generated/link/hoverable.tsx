/** @jsxImportSource react */
import { Link, Space } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space>
        <Link href={'#'} hoverable={false}>
          {'链接'}
        </Link>
        <Link href={'#'} status={'danger'} hoverable={false}>
          {'链接'}
        </Link>
      </Space>
    </>
  );
}
