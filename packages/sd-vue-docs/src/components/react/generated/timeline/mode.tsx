/** @jsxImportSource react */
import { Row, Timeline, TimelineItem } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <Row justify={'space-between'}>
        <Timeline mode={'alternate'} className={'sd:flex-1'}>
          <TimelineItem label={'2017-03-10'}>{'第一个里程碑'}</TimelineItem>
          <TimelineItem label={'2018-05-12'}>{'第二个里程碑'}</TimelineItem>
          <TimelineItem label={'2020-09-30'} position={'bottom'}>
            {' 第三个里程碑 '}
          </TimelineItem>
        </Timeline>
        <Timeline mode={'right'} className={'sd:flex-1'}>
          <TimelineItem label={'2017-03-10'}>{'第一个里程碑'}</TimelineItem>
          <TimelineItem label={'2018-05-12'}>{'第二个里程碑'}</TimelineItem>
          <TimelineItem label={'2020-09-30'} position={'bottom'}>
            {' 第三个里程碑 '}
          </TimelineItem>
        </Timeline>
      </Row>
    </>
  );
}
