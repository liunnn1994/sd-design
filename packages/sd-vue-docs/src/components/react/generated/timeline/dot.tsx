import { Timeline, TimelineItem } from '@sdata/web-react';
/** @jsxImportSource react */
import { IconCheck } from '@sdata/web-react/icon';
import { IconClockCircle } from '@sdata/web-react/icon';

export default function Example() {
  return (
    <>
      <div className={'sd:flex'}>
        <Timeline className={'sd:mr-10'}>
          <TimelineItem label={'2020-04-12'} dotColor={'#00B42A'}>
            {' 第一个里程碑 '}
          </TimelineItem>
          <TimelineItem label={'2020-05-17'}>{' 第二个里程碑 '}</TimelineItem>
          <TimelineItem
            label={'2020-06-22'}
            dot={
              <>
                <IconClockCircle className={'sd:text-xs sd:text-[#f53f3f]'} />
              </>
            }
          >
            {' 第三个里程碑 '}
          </TimelineItem>
          <TimelineItem label={'2020-06-22'} dotColor={'var(--color-fill-4)'}>
            {' 第三个里程碑 '}
          </TimelineItem>
        </Timeline>
        <Timeline className={'sd:mr-10'}>
          <TimelineItem
            label={'2020-04-12'}
            dot={
              <>
                <IconCheck
                  className={
                    'sd:text-xs sd:p-0.5 sd:box-border sd:rounded-full sd:bg-[var(--color-primary-light-1)]'
                  }
                />
              </>
            }
          >
            {' 第一个里程碑 '}
          </TimelineItem>
          <TimelineItem
            label={'2020-05-17'}
            dot={
              <>
                <IconCheck
                  className={
                    'sd:text-xs sd:p-0.5 sd:box-border sd:rounded-full sd:bg-[var(--color-primary-light-1)]'
                  }
                />
              </>
            }
          />
          <TimelineItem label={'2020-06-22'}>{'第三个里程碑'}</TimelineItem>
          <TimelineItem label={'2020-06-22'} dotColor={'var(--color-fill-4)'}>
            {' 第三个里程碑 '}
          </TimelineItem>
        </Timeline>
        <Timeline>
          <TimelineItem label={'2020-04-12'}>{'第一个里程碑'}</TimelineItem>
          <TimelineItem label={'2020-05-17'} dotColor={'var(--color-fill-4)'}>
            {' 第二个里程碑 '}
          </TimelineItem>
          <TimelineItem label={'2020-06-22'} dotColor={'var(--color-fill-4)'}>
            {' 第三个里程碑 '}
          </TimelineItem>
        </Timeline>
      </div>
    </>
  );
}
