/** @jsxImportSource react */
import { Timeline, TimelineItem, TypographyText } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Timeline>
        <TimelineItem label={'2017-03-10'} lineType={'dashed'}>
          {' 第一个里程碑 '}
          <br />
          <TypographyText type={'secondary'} className={'sd:text-xs sd:mt-1'}>
            {' 这是一条说明消息 '}
          </TypographyText>
        </TimelineItem>
        <TimelineItem label={'2018-05-12'} lineType={'dashed'}>
          {' 第二个里程碑 '}
          <br />
          <TypographyText type={'secondary'} className={'sd:text-xs sd:mt-1'}>
            {' 这是一条说明消息 '}
          </TypographyText>
        </TimelineItem>
        <TimelineItem label={'2020-09-30'} lineType={'dashed'}>
          {' 第三个里程碑 '}
          <br />
          <TypographyText type={'secondary'} className={'sd:text-xs sd:mt-1'}>
            {' 这是一条说明消息 '}
          </TypographyText>
        </TimelineItem>
      </Timeline>
    </>
  );
}
