/** @jsxImportSource react */
import { Card, Link } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <div data-v-cefc21f8="" className={'sd:flex'}>
        <Card
          data-v-cefc21f8=""
          className={'sd:w-90'}
          title={'SD 卡片'}
          hoverable={true}
          extra={
            <>
              <Link data-v-cefc21f8="">{'更多'}</Link>
            </>
          }
        >
          {' 卡片内容 '}
          <br data-v-cefc21f8="" />
          {' 卡片内容 '}
        </Card>
        <Card
          data-v-cefc21f8=""
          className={'card-demo'}
          title={'自定义悬停样式'}
          hoverable={true}
          extra={
            <>
              <Link data-v-cefc21f8="">{'更多'}</Link>
            </>
          }
        >
          {' 卡片内容 '}
          <br data-v-cefc21f8="" />
          {' 卡片内容 '}
        </Card>
      </div>
      <style>
        {
          '\n.card-demo[data-v-cefc21f8] {\n    width: 360px;\n    margin-left: 24px;\n    transition-property: all;\n}\n.card-demo[data-v-cefc21f8]:hover {\n    transform: translateY(-4px);\n}\n'
        }
      </style>
    </>
  );
}
