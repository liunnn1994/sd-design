import { Link, Space } from '@sdata/web-react';
/** @jsxImportSource react */
import { IconEdit } from '@sdata/web-react/icon';
import { useState } from 'react';

export default function Example() {
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);
  function handleClick1() {
    setLoading1(true);
    setTimeout(() => {
      setLoading1(false);
    }, 3000);
  }
  function handleClick2() {
    setLoading2(true);
    setTimeout(() => {
      setLoading2(false);
    }, 3000);
  }

  return (
    <>
      <Space>
        <Link loading={true}>{'链接'}</Link>
        <Link loading={loading1} onClick={handleClick1}>
          {'链接'}
        </Link>
        <Link
          loading={loading2}
          onClick={handleClick2}
          icon={
            <>
              <IconEdit />
            </>
          }
        >
          {' 链接 '}
        </Link>
      </Space>
    </>
  );
}
