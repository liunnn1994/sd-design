/** @jsxImportSource react */
import type { TabsType } from '@sdata/web-react';

import { Radio, RadioGroup, Space, TabPane, Tabs } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [type, setType] = useState<TabsType>('line');
  const [size, setSize] = useState<'mini' | 'small' | 'medium' | 'large'>('medium');

  return (
    <>
      <Space direction={'vertical'} size={'large'}>
        <RadioGroup
          value={type}
          onValueChange={(next) => setType(next as typeof type)}
          type={'button'}
        >
          <Radio value={'line'}>{'线形'}</Radio>
          <Radio value={'card'}>{'卡片'}</Radio>
          <Radio value={'card-gutter'}>{'卡片间距'}</Radio>
          <Radio value={'text'}>{'文本'}</Radio>
          <Radio value={'rounded'}>{'圆角'}</Radio>
          <Radio value={'capsule'}>{'胶囊'}</Radio>
        </RadioGroup>
        <RadioGroup
          value={size}
          onValueChange={(next) => setSize(next as typeof size)}
          type={'button'}
        >
          <Radio value={'mini'}>{'迷你'}</Radio>
          <Radio value={'small'}>{'小'}</Radio>
          <Radio value={'medium'}>{'中'}</Radio>
          <Radio value={'large'}>{'大'}</Radio>
        </RadioGroup>
        <Tabs type={type} size={size}>
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
