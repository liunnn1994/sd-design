import { Timeline, TimelineItem } from '@sdata/web-react';
/** @jsxImportSource react */
import { IconExclamationCircleFill } from '@sdata/web-react/icon';

export default function Example() {
  return (
    <>
      <Timeline>
        <TimelineItem label={'2017-03-10'} dotColor={'#00B42A'}>
          {' 第一个里程碑 '}
        </TimelineItem>
        <TimelineItem label={'2018-05-22'}>{'第二个里程碑'}</TimelineItem>
        <TimelineItem label={'2020-06-22'} dotColor={'#F53F3F'}>
          {' 第三个里程碑 '}
          <IconExclamationCircleFill className={'sd:text-[f53f3f] sd:text-xs sd:ml-1'} />
        </TimelineItem>
        <TimelineItem label={'2020-09-30'} dotColor={'#C9CDD4'}>
          {' 第四个里程碑 '}
        </TimelineItem>
      </Timeline>
    </>
  );
}
