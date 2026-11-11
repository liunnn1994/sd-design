import type { ComponentPropsWithRef, CSSProperties, ReactNode } from 'react';

import {
  createCountdown,
  getCountdownDisplay,
  getCountdownParts,
} from '@sdata/web-core/statistic/countdown';
import {
  createStatistic,
  getStatisticInitialValue,
  getStatisticNumberFormat,
  formatStatisticDate,
} from '@sdata/web-core/statistic/foundation';
import { useLayoutEffect, useRef, useState } from 'react';

import { useAfterRender } from '../_shared/use-after-render.js';
import { usePrefix } from '../config-provider/index.js';
import { NumberFlow } from '../number-flow/index.js';

export interface StatisticProps extends Omit<
  ComponentPropsWithRef<'div'>,
  'title' | 'prefix' | 'children'
> {
  title?: ReactNode;
  value?: number | Date;
  format?: string;
  extra?: ReactNode;
  start?: boolean;
  precision?: number;
  showGroupSeparator?: boolean;
  animation?: boolean;
  animationDuration?: number;
  valueFrom?: number;
  placeholder?: string;
  valueStyle?: CSSProperties;
  prefix?: ReactNode;
  suffix?: ReactNode;
}
export type StatisticInstance = HTMLDivElement;
export type CountdownInstance = HTMLDivElement;

function StatisticComponent({
  title,
  value,
  format = 'HH:mm:ss',
  extra,
  start = true,
  precision = 0,
  showGroupSeparator = false,
  animation = true,
  animationDuration = 2000,
  valueFrom,
  placeholder,
  valueStyle,
  prefix,
  suffix,
  className,
  ...attrs
}: StatisticProps) {
  const cls = usePrefix('statistic');
  const props = { value, start, animation, valueFrom };
  const [display, setDisplay] = useState(() => getStatisticInitialValue(props));
  const live = useRef({ props, display });
  live.current = { props, display };
  const afterRender = useAfterRender();
  const [foundation] = useState(() =>
    createStatistic({
      get props() {
        return live.current.props;
      },
      get display() {
        return live.current.display;
      },
      set display(next) {
        live.current.display = next;
        setDisplay(next);
      },
      afterRender,
    }),
  );
  useLayoutEffect(() => {
    void foundation.mount();
  }, [foundation]);
  const previous = useRef({ start, value });
  useLayoutEffect(() => {
    if (previous.current.start !== start) foundation.syncStart(start);
    if (previous.current.value !== value) foundation.syncValue(value);
    previous.current = { start, value };
  }, [foundation, start, value]);
  const date = typeof display === 'number' ? null : formatStatisticDate(display, format);
  return (
    <div {...attrs} className={[cls, className].filter(Boolean).join(' ')}>
      {title != null && <div className={`${cls}-title`}>{title}</div>}
      <div className={`${cls}-content`}>
        <div className={`${cls}-value`} style={valueStyle}>
          {value === undefined ? (
            <span>{placeholder}</span>
          ) : (
            <>
              {prefix != null && <span className={`${cls}-prefix`}>{prefix}</span>}
              {typeof display === 'number' ? (
                <NumberFlow
                  value={display}
                  animated={animation}
                  format={getStatisticNumberFormat(precision, showGroupSeparator)}
                  transformTiming={{ duration: animationDuration }}
                />
              ) : (
                String(date ?? '')
              )}
              {suffix != null && <span className={`${cls}-suffix`}>{suffix}</span>}
            </>
          )}
        </div>
        {extra != null && <div className={`${cls}-extra`}>{extra}</div>}
      </div>
    </div>
  );
}

export interface CountdownProps extends Omit<ComponentPropsWithRef<'div'>, 'title' | 'children'> {
  title?: ReactNode;
  value?: number;
  now?: number;
  format?: string;
  start?: boolean;
  animation?: boolean;
  valueStyle?: CSSProperties;
  onFinish?: () => void;
}

export function Countdown({
  title,
  value: deadline,
  now: initialNow,
  format = 'HH:mm:ss',
  start = true,
  animation = true,
  valueStyle,
  onFinish,
  className,
  ...attrs
}: CountdownProps) {
  const cls = usePrefix('statistic');
  const [defaults] = useState(() => {
    const now = Date.now();
    return { now, value: now + 300000 };
  });
  const value = deadline ?? defaults.value;
  const now = initialNow ?? defaults.now;
  const props = { value, now, format, start };
  const [display, setDisplay] = useState(() => getCountdownDisplay(value, now, format));
  const live = useRef({ props, display, onFinish });
  live.current = { props, display, onFinish };
  const [foundation] = useState(() =>
    createCountdown({
      get props() {
        return live.current.props;
      },
      get display() {
        return live.current.display;
      },
      set display(next) {
        live.current.display = next;
        setDisplay(next);
      },
      now: () => Date.now(),
      setInterval: (callback, delay) => window.setInterval(callback, delay),
      clearInterval: (timer) => window.clearInterval(timer),
      finish: () => live.current.onFinish?.(),
    }),
  );
  useLayoutEffect(() => {
    foundation.mount();
    return foundation.stop;
  }, [foundation]);
  const previous = useRef(props);
  useLayoutEffect(() => {
    const old = previous.current;
    if (old.value !== value || old.now !== now || old.format !== format)
      foundation.syncValue(old.value);
    if (old.start !== start) foundation.syncStart(start);
    previous.current = props;
  }, [foundation, value, now, format, start]);
  return (
    <div {...attrs} className={[cls, `${cls}-countdown`, className].filter(Boolean).join(' ')}>
      {title != null && <div className={`${cls}-title`}>{title}</div>}
      <div className={`${cls}-content`}>
        <div className={`${cls}-value`} style={valueStyle}>
          {getCountdownParts(display).map((part, index) =>
            part.type === 'number' ? (
              <NumberFlow
                key={`${part.type}-${index}`}
                value={Number(part.value)}
                animated={animation}
                format={{ minimumIntegerDigits: part.value.length, useGrouping: false }}
              />
            ) : (
              part.value
            ),
          )}
        </div>
      </div>
    </div>
  );
}

export const Statistic = Object.assign(StatisticComponent, { Countdown });
export default Statistic;
