/** @jsxImportSource react */
import type { TabsPosition } from '@sdata/web-react';

import { Radio, RadioGroup, Space, TabPane, Tabs } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [position, setPosition] = useState<TabsPosition>('top');

  return (
    <>
      <Space direction={'vertical'} size={'large'}>
        <RadioGroup
          value={position}
          onValueChange={(next) => setPosition(next as typeof position)}
          type={'button'}
        >
          <Radio value={'top'}>{'顶部'}</Radio>
          <Radio value={'right'}>{'右侧'}</Radio>
          <Radio value={'bottom'}>{'底部'}</Radio>
          <Radio value={'left'}>{'左侧'}</Radio>
        </RadioGroup>
        <Tabs position={position}>
          <TabPane key={'1'} title={'标签页 1'}>
            {' 标签页面板内容 1 '}
          </TabPane>
          <TabPane key={'2'} title={'标签页 2'}>
            {' 标签页面板内容 2 '}
          </TabPane>
          <TabPane key={'3'} title={'标签页 3'}>
            {' 标签页面板内容 3 '}
          </TabPane>
        </Tabs>
      </Space>
    </>
  );
}
