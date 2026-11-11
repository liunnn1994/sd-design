import { Link, Space } from '@sdata/web-react';
/** @jsxImportSource react */
import { IconEdit } from '@sdata/web-react/icon';

export default function Example() {
  return (
    <>
      <div className={'sd:grid sd:gap-4'}>
        <div>
          <Space>
            <Link href={'#'} icon={true}>
              {'链接'}
            </Link>
            <Link href={'#'} disabled={true} icon={true}>
              {'链接'}
            </Link>
          </Space>
        </div>
        <div>
          <Space>
            <Link
              href={'#'}
              icon={
                <>
                  <IconEdit />
                </>
              }
            >
              {' 链接 '}
            </Link>
            <Link
              href={'#'}
              disabled={true}
              icon={
                <>
                  <IconEdit />
                </>
              }
            >
              {' 链接 '}
            </Link>
          </Space>
        </div>
      </div>
    </>
  );
}
