import type { Direction } from '@sdata/web-core/_utils/constant';
import type {
  DotType,
  LabelPositionType,
  LineType,
  ModeType,
  PositionType,
} from '@sdata/web-core/timeline/types';
import type { ComponentRef as ReactComponentRef } from 'react';
import type { ComponentPropsWithRef, ReactNode } from 'react';

import {
  getTimelineItemState,
  getTimelineDotStyle,
  getTimelineLineStyle,
  hasTimelinePending,
  type TimelineState,
} from '@sdata/web-core/timeline/foundation';
import {
  createContext,
  useContext,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { useItemIndex } from '../_shared/use-item-index.js';
import { useConfig, usePrefix } from '../config-provider/index.js';
import { Spin, type SpinProps } from '../spin/index.js';

export type { DotType, LabelPositionType, LineType, ModeType, PositionType };
export interface TimelineProps extends ComponentPropsWithRef<'div'> {
  reverse?: boolean;
  direction?: Direction;
  mode?: ModeType;
  pending?: boolean | string;
  pendingContent?: ReactNode;
  dot?: ReactNode;
  spinProps?: SpinProps;
  labelPosition?: LabelPositionType;
}
export interface TimelineItemProps extends ComponentPropsWithRef<'div'> {
  dotColor?: string;
  dotType?: DotType;
  lineType?: LineType;
  lineColor?: string;
  label?: ReactNode;
  position?: PositionType;
  dot?: ReactNode;
  pending?: boolean;
}
const TimelineContext = createContext<(TimelineState<string> & { parentCls: string }) | undefined>(
  undefined,
);
const CollectorContext = createContext<
  { collect(id: string, index: number): void; remove(id: string): void } | undefined
>(undefined);

function TimelineRoot({
  reverse = false,
  direction = 'vertical',
  mode = 'left',
  pending,
  pendingContent,
  dot,
  spinProps,
  labelPosition = 'same',
  children,
  className,
  ...attrs
}: TimelineProps) {
  const prefix = usePrefix('timeline');
  const config = useConfig();
  const [items, setItems] = useState(new Map<string, number>());
  const [collector] = useState(() => ({
    collect(id: string, index: number) {
      setItems((current) =>
        current.get(id) === index ? current : new Map(current).set(id, index),
      );
    },
    remove(id: string) {
      setItems((current) => {
        if (!current.has(id)) return current;
        const next = new Map(current);
        next.delete(id);
        return next;
      });
    },
  }));
  const hasPending = hasTimelinePending(pending, pendingContent !== undefined);
  const context = {
    items: [...items.entries()].sort((a, b) => a[1] - b[1]).map(([id]) => id),
    reverse,
    direction,
    mode,
    labelPosition,
    hasPending,
    parentCls: prefix,
  };
  return (
    <TimelineContext.Provider value={context}>
      <CollectorContext.Provider value={collector}>
        <div
          role="list"
          {...attrs}
          className={[
            prefix,
            `${prefix}-${mode}`,
            `${prefix}-direction-${direction}`,
            reverse && `${prefix}-is-reverse`,
            className,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {children}
          {hasPending && (
            <TimelineItem
              pending
              lineType="dashed"
              dot={
                dot !== undefined ? (
                  dot
                ) : (
                  <Spin size={12} {...config.timelineSpinProps} {...spinProps} />
                )
              }
            >
              {pendingContent !== undefined || pending !== true ? (
                <div>{pendingContent !== undefined ? pendingContent : pending}</div>
              ) : undefined}
            </TimelineItem>
          )}
        </div>
      </CollectorContext.Provider>
    </TimelineContext.Provider>
  );
}
export function TimelineItem({
  dotColor,
  dotType = 'solid',
  lineType = 'solid',
  lineColor,
  label,
  position,
  dot,
  pending = false,
  children,
  className,
  ref,
  ...attrs
}: TimelineItemProps) {
  const prefix = usePrefix('timeline-item');
  const context = useContext(TimelineContext);
  const collector = useContext(CollectorContext);
  const root = useRef<HTMLDivElement>(null);
  const id = useId();
  const index = useItemIndex(root, `.${prefix}`, context?.parentCls);
  useImperativeHandle(ref, () => root.current!, []);
  useLayoutEffect(() => {
    if (pending || index < 0) collector?.remove(id);
    else collector?.collect(id, index);
  }, [collector, id, index, pending]);
  useLayoutEffect(() => () => collector?.remove(id), [collector, id]);
  const state = getTimelineItemState(pending, id, context ?? {}, position);
  const relative = context?.labelPosition === 'relative';
  return (
    <div
      role="listitem"
      {...attrs}
      ref={root}
      className={[
        prefix,
        `${prefix}-${state.direction}-${state.position}`,
        context?.labelPosition && `${prefix}-label-${context.labelPosition}`,
        state.last && `${prefix}-last`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className={`${prefix}-dot-wrapper`}>
        <div
          className={`${prefix}-dot-line ${prefix}-dot-line-is-${state.direction}`}
          style={getTimelineLineStyle(context?.direction, lineType, lineColor)}
        />
        <div className={`${prefix}-dot-content`}>
          {dot !== undefined ? (
            <div className={`${prefix}-dot-custom`}>{dot}</div>
          ) : (
            <div
              className={`${prefix}-dot ${prefix}-dot-${dotType}`}
              style={getTimelineDotStyle(dotType, dotColor)}
            />
          )}
        </div>
      </div>
      <div className={`${prefix}-content-wrapper`}>
        {children !== undefined && <div className={`${prefix}-content`}>{children}</div>}
        {!relative && <div className={`${prefix}-label`}>{label}</div>}
      </div>
      {relative && <div className={`${prefix}-label`}>{label}</div>}
    </div>
  );
}
export const Timeline = Object.assign(TimelineRoot, { Item: TimelineItem });
export default Timeline;

export type TimelineInstance = ReactComponentRef<typeof Timeline>;
export type TimelineItemInstance = ReactComponentRef<typeof TimelineItem>;
