/** @jsxImportSource react */
import { Radio, RadioGroup, Timeline, TimelineItem, TypographyText } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [isReverse, setIsReverse] = useState(false);
  const onChange = (bool: string | number | boolean) => {
    setIsReverse(Boolean(bool));
  };

  return (
    <>
      <div className={'sd:mb-10'}>
        <TypographyText className={'sd:mr-2 sd:align-middle'}>{' 倒序 '}</TypographyText>
        <RadioGroup onChange={onChange} className={'sd:mb-7.5'} value={isReverse}>
          <Radio value={false}>{'不倒序'}</Radio>
          <Radio value={true}>{'倒序'}</Radio>
        </RadioGroup>
      </div>
      <Timeline reverse={isReverse}>
        <TimelineItem label={'2017-03-10'}>{'第一个里程碑'}</TimelineItem>
        <TimelineItem label={'2018-05-12'}>{'第二个里程碑'}</TimelineItem>
        <TimelineItem label={'2020-09-30'}>{'第三个里程碑'}</TimelineItem>
      </Timeline>
    </>
  );
}
