/** @jsxImportSource react */
import { TabPane, Tabs } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Tabs defaultActiveKey={'2'}>
        <TabPane key={'1'} title={'标签页 1'}>
          {' 标签页面板内容 1 '}
        </TabPane>
        <TabPane key={'2'} title={'标签页 2'}>
          {' 标签页面板内容 2 '}
        </TabPane>
        <TabPane key={'3'} title={<>{'标签页 3'}</>}>
          {' 标签页面板内容 3 '}
        </TabPane>
      </Tabs>
    </>
  );
}
