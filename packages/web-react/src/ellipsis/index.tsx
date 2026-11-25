import type { HTMLAttributes, ReactElement, ReactNode, Ref } from 'react';

import {
  getEllipsisMeasurementStyle,
  getEllipsisRootStyle,
  resolveEllipsisMaxLines,
} from '@sdata/web-core/ellipsis/data';
import { createEllipsisFoundation } from '@sdata/web-core/ellipsis/foundation';
import { createElement, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';

import type { TooltipProps } from '../tooltip/index.js';

import { useAfterRender } from '../_shared/use-after-render.js';
import { RichLineClamp } from '../clamp/index.js';
import { usePrefix } from '../config-provider/index.js';
import { Tooltip } from '../tooltip/index.js';

export type EllipsisTooltipProps = Omit<TooltipProps, 'children'> & { always?: boolean };
export interface EllipsisExposed {
  readonly triggerRef: HTMLElement | undefined;
  readonly triggerElement: HTMLElement | undefined;
  waitForMeasurement(): Promise<void>;
  toggleExpanded(): void;
}
export type EllipsisInstance = EllipsisExposed;
export interface EllipsisProps extends HTMLAttributes<HTMLElement> {
  lineClamp?: number | string | undefined;
  expandTrigger?: 'click' | undefined;
  tooltip?: boolean | EllipsisTooltipProps;
  tooltipContent?: ReactNode;
  ref?: Ref<EllipsisExposed>;
}

export function Ellipsis(props: EllipsisProps): ReactElement {
  return <EllipsisRenderer {...props} active />;
}

export function EllipsisRenderer({
  active,
  lineClamp,
  expandTrigger,
  tooltip = true,
  tooltipContent,
  ref,
  children,
  style,
  className,
  title,
  onClick,
  onKeyDown,
  ...attrs
}: EllipsisProps & { active: boolean }): ReactElement {
  const prefix = usePrefix('ellipsis');
  const root = useRef<HTMLElement | null>(null);
  const afterRender = useAfterRender();
  const [, rerender] = useState(0);
  const tooltipConfig = typeof tooltip === 'object' ? tooltip : {};
  const live = useRef({ expandTrigger, tooltipConfig, enableTooltip: tooltip !== false });
  live.current = { expandTrigger, tooltipConfig, enableTooltip: tooltip !== false };
  const [state] = useState(() => ({
    measurementHtml: '',
    measurementWidth: 0,
    measurementPadding: '0',
    text: '',
    isEllipsis: false,
    expanded: false,
  }));
  const update = <K extends keyof typeof state>(key: K, value: (typeof state)[K]) => {
    if (Object.is(state[key], value)) return;
    state[key] = value;
    rerender((version) => version + 1);
  };
  const [foundation] = useState(() =>
    createEllipsisFoundation({
      get triggerElement() {
        return root.current ?? undefined;
      },
      get expandTrigger() {
        return live.current.expandTrigger;
      },
      get tooltipConfig() {
        return live.current.tooltipConfig;
      },
      get enableTooltip() {
        return live.current.enableTooltip;
      },
      get measurementHtml() {
        return state.measurementHtml;
      },
      set measurementHtml(next) {
        update('measurementHtml', next);
      },
      get measurementWidth() {
        return state.measurementWidth;
      },
      set measurementWidth(next) {
        update('measurementWidth', next);
      },
      get measurementPadding() {
        return state.measurementPadding;
      },
      set measurementPadding(next) {
        update('measurementPadding', next);
      },
      get text() {
        return state.text;
      },
      set text(next) {
        update('text', next);
      },
      get isEllipsis() {
        return state.isEllipsis;
      },
      set isEllipsis(next) {
        update('isEllipsis', next);
      },
      get expanded() {
        return state.expanded;
      },
      set expanded(next) {
        update('expanded', next);
      },
    }),
  );
  useLayoutEffect(() => {
    if (!active) return;
    foundation.syncMeasurement();
    foundation.startMeasurementFallback();
    const stop = foundation.observeTrigger(root.current ?? undefined);
    const observer = new ResizeObserver(foundation.syncMeasurement);
    if (root.current) observer.observe(root.current);
    return () => {
      stop?.();
      observer.disconnect();
      foundation.flushMeasurementWaiters();
    };
  }, [foundation, active, tooltip !== false, lineClamp !== undefined]);
  useLayoutEffect(() => {
    if (active) foundation.syncMeasurement();
  });
  useLayoutEffect(() => {
    if (active) {
      foundation.resetExpanded();
      void afterRender().then(foundation.syncMeasurement);
    }
  }, [foundation, afterRender, active, lineClamp]);
  useImperativeHandle(
    ref,
    () => ({
      get triggerRef() {
        return root.current ?? undefined;
      },
      get triggerElement() {
        return root.current ?? undefined;
      },
      waitForMeasurement: foundation.waitForMeasurement,
      toggleExpanded: foundation.handleClick,
    }),
    [foundation],
  );
  const isLineClamp = lineClamp !== undefined;
  const expandable = active ? foundation.isExpandable() : expandTrigger === 'click';
  const target = createElement(
    isLineClamp ? 'div' : 'span',
    {
      ...attrs,
      'ref': root,
      'data-part': 'root',
      'className': [
        prefix,
        !isLineClamp && !state.expanded && `${prefix}--single-line`,
        isLineClamp && `${prefix}--line-clamp`,
        expandable && `${prefix}--expandable`,
        state.expanded && `${prefix}--expanded`,
        className,
      ]
        .filter(Boolean)
        .join(' '),
      'style': {
        ...style,
        ...getEllipsisRootStyle(isLineClamp, state.expanded, () =>
          resolveEllipsisMaxLines(lineClamp),
        ),
      },
      'title': title ?? foundation.getNativeTitle(),
      'role': expandable ? 'button' : undefined,
      'tabIndex': expandable ? 0 : undefined,
      'aria-expanded': expandTrigger === 'click' ? state.expanded : undefined,
      'onClick': async (event: React.MouseEvent<HTMLElement>) => {
        onClick?.(event);
        if (!active) return;
        await foundation.waitForMeasurement();
        foundation.handleClick(event.nativeEvent);
      },
      'onKeyDown': (event: React.KeyboardEvent<HTMLElement>) => {
        onKeyDown?.(event);
        foundation.handleKeydown(event.nativeEvent);
      },
    },
    isLineClamp ? children : <span className={`${prefix}-content`}>{children}</span>,
    active && (
      <RichLineClamp
        as="span"
        key={state.measurementHtml}
        data-ellipsis-measure
        aria-hidden="true"
        inert
        html={state.measurementHtml}
        maxLines={resolveEllipsisMaxLines(lineClamp)}
        style={getEllipsisMeasurementStyle(state.measurementWidth, state.measurementPadding)}
        onClampChange={foundation.handleClampChange}
      />
    ),
  );
  if (tooltip === false) return target;
  const { always: _always, ...tooltipBindings } = tooltipConfig;
  return (
    <Tooltip
      {...tooltipBindings}
      disabled={foundation.getTooltipDisabled()}
      content={tooltipContent ?? children}
    >
      {target}
    </Tooltip>
  );
}

export default Ellipsis;
export { PerformantEllipsis } from './performant.js';
export type {
  PerformantEllipsisProps,
  PerformantEllipsisExposed,
  PerformantEllipsisInstance,
} from './performant.js';
