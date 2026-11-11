import { Checkbox, Row, Timeline, TimelineItem } from '@sdata/web-react';
/** @jsxImportSource react */
import { IconFire } from '@sdata/web-react/icon';
import { useState } from 'react';

export default function Example() {
  const [pendingProps, setPendingProps] = useState<{
    direction?: 'horizontal';
    reverse?: boolean;
    pending?: string | boolean;
    hasPendingDot?: boolean;
  }>({});
  function onChange(newProps: {
    direction?: 'horizontal';
    reverse?: boolean;
    pending?: string | boolean;
    hasPendingDot?: boolean;
  }) {
    setPendingProps({
      ...pendingProps,
      ...newProps,
    });
  }

  return (
    <>
      <Row align={'center'} className={'sd:mb-6'}>
        <Checkbox
          modelValue={!!pendingProps.direction}
          onChange={(v) => onChange({ direction: v ? 'horizontal' : undefined })}
        >
          {' horizontal     '}
        </Checkbox>
        <Checkbox
          modelValue={!!pendingProps.reverse}
          onChange={(v) => onChange({ reverse: Boolean(v) })}
        >
          {' reverse     '}
        </Checkbox>
        <Checkbox
          modelValue={!!pendingProps.pending}
          onChange={(v) => onChange({ pending: v ? 'This is a pending dot' : false })}
        >
          {' pending     '}
        </Checkbox>
        <Checkbox
          modelValue={!!pendingProps.hasPendingDot}
          onChange={(v) => onChange({ hasPendingDot: Boolean(v) })}
        >
          {' 自定义等待图标 '}
        </Checkbox>
      </Row>
      <Timeline
        {...pendingProps}
        dot={
          <>
            <IconFire className={'sd:text-[#e70a0a]'} />
          </>
        }
      >
        <TimelineItem label={'2017-03-10'} dotColor={'#52C419'}>
          {' 第一个里程碑 '}
        </TimelineItem>
        <TimelineItem label={'2018-05-12'} dotColor={'#F5222D'}>
          {' 第二个里程碑 '}
        </TimelineItem>
        <TimelineItem label={'2020-09-30'}>{'第三个里程碑'}</TimelineItem>
      </Timeline>
    </>
  );
}
