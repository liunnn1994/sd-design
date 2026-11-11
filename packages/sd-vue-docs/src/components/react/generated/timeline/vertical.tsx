/** @jsxImportSource react */
import type { ModeType } from '@sdata/web-react';

import { Radio, RadioGroup, Row, Timeline, TimelineItem, TypographyText } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [mode, setMode] = useState<ModeType>('left');
  const onChange = (_mode: string | number | boolean) => {
    setMode(_mode as ModeType);
  };

  return (
    <>
      <div>
        <Row align={'center'} className={'sd:mb-6'}>
          <TypographyText>{'mode:    '}</TypographyText>
          <RadioGroup onChange={onChange} value={mode}>
            <Radio value={'left'}>{'左侧'}</Radio>
            <Radio value={'right'}>{'右侧'}</Radio>
            <Radio value={'alternate'}>{'交替'}</Radio>
          </RadioGroup>
        </Row>
        <Timeline mode={mode} labelPosition={'relative'}>
          <TimelineItem label={'2012-08'}>
            <Row className={'sd:inline-flex sd:items-center'}>
              <img
                alt={''}
                width={'40'}
                className={'sd:mr-4 sd:mb-3'}
                src={'https://picsum.photos/240/240'}
              />
              <div className={'sd:mb-3'}>
                {' 事项一 '}
                <div className={'sd:text-xs sd:text-[#4e5969]'}>{' 成立于 2012 年 '}</div>
              </div>
            </Row>
          </TimelineItem>
          <TimelineItem label={'2017-05'}>
            <Row className={'sd:inline-flex sd:items-center'}>
              <img
                alt={''}
                width={'40'}
                className={'sd:mr-4 sd:mb-3'}
                src={'https://picsum.photos/240/240'}
              />
              <div className={'sd:mb-3'}>
                {' 事项二 '}
                <div className={'sd:text-xs sd:text-[#4e5969]'}>{' 成立于 2017 年 '}</div>
              </div>
            </Row>
          </TimelineItem>
          <TimelineItem label={'2018-07'}>
            <Row className={'sd:inline-flex sd:items-center'}>
              <img
                alt={''}
                width={'40'}
                className={'sd:mr-4 sd:mb-3'}
                src={'https://picsum.photos/240/240'}
              />
              <div className={'sd:mb-3'}>
                {' 事项三 '}
                <div className={'sd:text-xs sd:text-[#4e5969]'}>{' 成立于 2018 年 '}</div>
              </div>
            </Row>
          </TimelineItem>
        </Timeline>
      </div>
    </>
  );
}
