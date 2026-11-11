/** @jsxImportSource react */
import { TabPane, Tabs } from '@sdata/web-react';
import { IconCalendar, IconClockCircle, IconUser } from '@sdata/web-react/icon';

export default function Example() {
  return (
    <>
      <Tabs>
        <TabPane
          key={'1'}
          title={
            <>
              <IconCalendar />
              {' 标签页 1 '}
            </>
          }
        >
          {' 标签页面板内容 1 '}
        </TabPane>
        <TabPane
          key={'2'}
          title={
            <>
              <IconClockCircle />
              {' 标签页 2 '}
            </>
          }
        >
          {' 标签页面板内容 2 '}
        </TabPane>
        <TabPane
          key={'3'}
          title={
            <>
              <IconUser />
              {' 标签页 3 '}
            </>
          }
        >
          {' 标签页面板内容 3 '}
        </TabPane>
      </Tabs>
    </>
  );
}
