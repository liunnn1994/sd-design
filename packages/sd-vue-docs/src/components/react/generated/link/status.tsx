/** @jsxImportSource react */
import { Link, Space } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Space direction={'vertical'}>
        <Space>
          <Link href={'#'}>{'普通链接'}</Link>
          <Link href={'#'} disabled={true}>
            {'普通链接'}
          </Link>
        </Space>
        <Space>
          <Link href={'#'} status={'success'}>
            {'成功链接'}
          </Link>
          <Link href={'#'} status={'success'} disabled={true}>
            {'成功链接'}
          </Link>
        </Space>
        <Space>
          <Link href={'#'} status={'warning'}>
            {'警告链接'}
          </Link>
          <Link href={'#'} status={'warning'} disabled={true}>
            {'警告链接'}
          </Link>
        </Space>
        <Space>
          <Link href={'#'} status={'danger'}>
            {'危险链接'}
          </Link>
          <Link href={'#'} status={'danger'} disabled={true}>
            {'危险链接'}
          </Link>
        </Space>
      </Space>
    </>
  );
}
