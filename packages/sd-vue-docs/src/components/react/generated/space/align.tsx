/** @jsxImportSource react */
import { Button, Card, Radio, RadioGroup, Space, TypographyText } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [align, setAlign] = useState<'start' | 'center' | 'end' | 'baseline'>('center');

  return (
    <>
      <div>
        <div className={'sd:mb-5'}>
          <RadioGroup
            value={align}
            onValueChange={(next) => setAlign(next as typeof align)}
            type={'button'}
          >
            <Radio value={'start'}>{'起始对齐'}</Radio>
            <Radio value={'center'}>{'居中'}</Radio>
            <Radio value={'end'}>{'末端对齐'}</Radio>
            <Radio value={'baseline'}>{'基线对齐'}</Radio>
          </RadioGroup>
        </div>
        <Space align={align} className={'sd:bg-[var(--color-fill-2)] sd:p-2.5'}>
          <TypographyText>{'间距：'}</TypographyText>
          <Button type={'primary'}>{'项目 2'}</Button>
          <Card title={'卡片'}>{' 卡片内容 '}</Card>
        </Space>
      </div>
    </>
  );
}
