/** @jsxImportSource react */
import type { TabTriggerEvent } from '@sdata/web-react';

import { Radio, RadioGroup, TabPane, Tabs } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [trigger, setTrigger] = useState<TabTriggerEvent>('click');

  return (
    <>
      <div className={'sd:grid sd:gap-4'}>
        <RadioGroup value={trigger} onValueChange={(next) => setTrigger(next as typeof trigger)}>
          <Radio value={'click'}>{'点击'}</Radio>
          <Radio value={'hover'}>{'悬停'}</Radio>
        </RadioGroup>
        <Tabs defaultActiveKey={'1'} trigger={trigger}>
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
      </div>
    </>
  );
}
