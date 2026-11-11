/** @jsxImportSource react */
import type { LabelPositionType, ModeType } from '@sdata/web-react';

import { Radio, RadioGroup, Row, Timeline, TimelineItem, TypographyText } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [mode, setMode] = useState<ModeType>('left');
  const [pos, setPos] = useState<LabelPositionType>('same');
  const onLabelPositionChange = (_pos: string | number | boolean) => {
    setPos(_pos as LabelPositionType);
  };
  const onModeChange = (_mode: string | number | boolean) => {
    setMode(_mode as ModeType);
  };

  return (
    <>
      <div>
        <Row align={'center'}>
          <TypographyText>{'labelPosition:    '}</TypographyText>
          <RadioGroup onChange={onLabelPositionChange} value={pos}>
            <Radio value={'same'}>{'同侧'}</Radio>
            <Radio value={'relative'}>{'相对位置'}</Radio>
          </RadioGroup>
        </Row>
        <Row align={'center'} className={'sd:mt-5 sd:mb-6'}>
          <TypographyText>{'mode:    '}</TypographyText>
          <RadioGroup onChange={onModeChange} value={mode}>
            <Radio value={'left'}>{'左侧'}</Radio>
            <Radio value={'right'}>{'右侧'}</Radio>
            <Radio value={'alternate'}>{'交替'}</Radio>
          </RadioGroup>
        </Row>
        <Timeline mode={mode} labelPosition={pos}>
          <TimelineItem label={'2017-03-10'} dotColor={'#52C419'}>
            {' 第一个里程碑 '}
          </TimelineItem>
          <TimelineItem label={'2018-05-12'} dotColor={'#F5222D'}>
            {' 第二个里程碑 '}
          </TimelineItem>
          <TimelineItem label={'2020-09-30'} position={'bottom'}>
            {' 第三个里程碑 '}
          </TimelineItem>
        </Timeline>
      </div>
    </>
  );
}
