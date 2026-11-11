/** @jsxImportSource react */
import type { ScrollPosition, TabsPosition } from '@sdata/web-react';

import { Button, Radio, RadioGroup, Space, TabPane, Tabs } from '@sdata/web-react';
import { type ComponentProps, useState } from 'react';

function formatValue(value: unknown): string {
  return value == null
    ? ''
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
}

export default function Example() {
  const [position, setPosition] = useState<TabsPosition>('top');
  const [scrollPosition, setScrollPosition] = useState<ScrollPosition>('auto');
  const [activeKey, setActiveKey] =
    useState<NonNullable<ComponentProps<typeof Tabs>['activeKey']>>('Tab1');
  const tabs = Array.from({ length: 30 }, (v, i) => {
    return {
      key: `Tab${i + 1}`,
      title: `标签页 ${i + 1}`,
      content: `标签页面板内容 ${i + 1}`,
    };
  });
  const changeActive = () => {
    setActiveKey(`Tab${Math.floor(Math.random() * 30) + 1}`);
  };

  return (
    <>
      <Space direction={'vertical'} size={'large'}>
        <RadioGroup
          value={position}
          onValueChange={(next) => setPosition(next as typeof position)}
          type={'button'}
        >
          <Radio value={'left'}>{'左侧'}</Radio>
          <Radio value={'top'}>{'顶部'}</Radio>
          <Radio value={'right'}>{'右侧'}</Radio>
          <Radio value={'bottom'}>{'底部'}</Radio>
        </RadioGroup>
        <RadioGroup
          value={scrollPosition}
          onValueChange={(next) => setScrollPosition(next as typeof scrollPosition)}
          type={'button'}
        >
          <Radio value={'auto'}>{'自动'}</Radio>
          <Radio value={'start'}>{'起始对齐'}</Radio>
          <Radio value={'center'}>{'居中'}</Radio>
          <Radio value={'end'}>{'末端对齐'}</Radio>
        </RadioGroup>
        <Button onClick={changeActive}>
          {' 切换： '}
          {formatValue(activeKey)}
        </Button>
      </Space>
      <Tabs
        activeKey={activeKey}
        onActiveKeyChange={(next) => setActiveKey(next as typeof activeKey)}
        position={position}
        scrollPosition={scrollPosition}
        className={'sd:w-full sd:h-75 sd:mt-5'}
      >
        {tabs.map((tab) => (
          <TabPane key={tab.key} title={tab.title}>
            {formatValue(tab.content)}
          </TabPane>
        ))}
      </Tabs>
    </>
  );
}
