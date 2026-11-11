/** @jsxImportSource react */
import { Card, Spin } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [loading, setLoading] = useState(true);

  return (
    <>
      <Spin loading={loading} tip={'加载可能需要一些时间，请稍候…'}>
        <Card title={'SD 卡片'}>
          {
            ' SD Design 是一套面向数据工具与企业应用的组件库，提供统一的设计语言和丰富的交互组件，帮助团队高效构建清晰、易用的产品界面。 '
          }
        </Card>
      </Spin>
    </>
  );
}
