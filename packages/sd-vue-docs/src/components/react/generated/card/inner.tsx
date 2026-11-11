/** @jsxImportSource react */
import { Card, Link } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Card title={'SD 卡片'}>
        <Card
          className={'sd:mb-5'}
          title={'内层卡片标题'}
          extra={
            <>
              <Link>{'更多'}</Link>
            </>
          }
        >
          {' 内层卡片内容 '}
        </Card>
        <Card
          title={'内层卡片标题'}
          extra={
            <>
              <Link>{'更多'}</Link>
            </>
          }
        >
          {' 内层卡片内容 '}
        </Card>
      </Card>
    </>
  );
}
