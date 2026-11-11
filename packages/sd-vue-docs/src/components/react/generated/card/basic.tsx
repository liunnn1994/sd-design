/** @jsxImportSource react */
import { Card, Link } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <div className={'sd:flex'}>
        <Card
          className={'sd:w-90'}
          title={'SD 卡片'}
          extra={
            <>
              <Link>{'更多'}</Link>
            </>
          }
        >
          {
            ' SD Design 是一套面向数据工具与企业应用的组件库，提供统一的设计语言和丰富的交互组件，帮助团队高效构建清晰、易用的产品界面。 '
          }
        </Card>
      </div>
    </>
  );
}
