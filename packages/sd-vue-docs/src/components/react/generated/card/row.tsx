/** @jsxImportSource react */
import { getCssVarToken } from '@sdata/web-react';
import { Card, Link } from '@sdata/web-react';
import { type CSSProperties } from 'react';

export default function Example() {
  return (
    <>
      <div
        className={'sd:flex sd:w-full sd:box-border sd:p-10'}
        style={{ backgroundColor: `var(${getCssVarToken('--color-fill-2')})` } as CSSProperties}
      >
        <Card
          className={'sd:w-90'}
          title={'SD 卡片'}
          bordered={false}
          extra={
            <>
              <Link>{'更多'}</Link>
            </>
          }
        >
          {' 卡片内容 '}
          <br />
          {' 卡片内容 '}
        </Card>
        <Card
          className={'sd:w-90 sd:ml-6'}
          title={'悬停此处'}
          hoverable={true}
          bordered={false}
          extra={
            <>
              <Link>{'更多'}</Link>
            </>
          }
        >
          {' 卡片内容 '}
          <br />
          {' 卡片内容 '}
        </Card>
      </div>
    </>
  );
}
