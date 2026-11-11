/** @jsxImportSource react */
import { Tag, Timeline, TimelineItem } from '@sdata/web-react';
import { IconCheckCircleFill } from '@sdata/web-react/icon';

export default function Example() {
  return (
    <>
      <Timeline>
        <TimelineItem
          label={
            <>
              <Tag
                icon={
                  <>
                    <IconCheckCircleFill />
                  </>
                }
              >
                {' 已通过 '}
              </Tag>
            </>
          }
        >
          {' 代码审查 '}
        </TimelineItem>
      </Timeline>
    </>
  );
}
