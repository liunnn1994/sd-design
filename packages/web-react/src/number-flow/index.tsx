import type { NumberFlowPhase } from '@sdata/web-core/number-flow/foundation';
import type { NumberFlowProps as CoreProps } from '@sdata/web-core/number-flow/types';
import type { ComponentRef as ReactComponentRef } from 'react';
import type { ComponentPropsWithoutRef, CSSProperties, ReactNode, Ref } from 'react';

import { formatNumberFlow } from '@sdata/web-core/number-flow/formatter';
import {
  createNumberFlow,
  createNumberFlowDigits,
  getHighestChangedPosition,
  getNumberFlowStyles,
} from '@sdata/web-core/number-flow/foundation';
import {
  getNumberFlowTrend,
  parseDuration,
  sanitizeValue,
} from '@sdata/web-core/number-flow/utils';
import {
  useContext,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import type { NumberFlowGroup } from './group.js';

import { usePrefix } from '../config-provider/index.js';
import { NumberFlowGroupContext } from './group.js';
import { useCanAnimate } from './use-can-animate.js';
export { useCanAnimate } from './use-can-animate.js';
export { continuous } from '@sdata/web-core/number-flow/continuous';
export type {
  NumberFlowDigitContext,
  NumberFlowDigitOptions,
  NumberFlowDigits,
  NumberFlowFormat,
  NumberFlowPlugin,
  NumberFlowPluginContext,
  NumberFlowTrend,
  NumberFlowValue,
} from '@sdata/web-core/number-flow/types';
export { NumberFlowGroup } from './group.js';
export type { NumberFlowGroupProps } from './group.js';

export interface NumberFlowExposed {
  readonly el: HTMLSpanElement | null;
}
export type NumberFlowStyle = CSSProperties & Record<`--${string}`, string | number>;
export type NumberFlowInstance = NumberFlowExposed;
export interface NumberFlowProps
  extends CoreProps, Omit<ComponentPropsWithoutRef<'span'>, 'prefix' | 'children' | 'style'> {
  style?: NumberFlowStyle;
  prefixContent?: ReactNode;
  suffixContent?: ReactNode;
  onAnimationsStart?: () => void;
  onAnimationsFinish?: () => void;
  ref?: Ref<NumberFlowExposed>;
}

export function NumberFlow({
  value,
  locales,
  format,
  prefix,
  suffix,
  trend,
  plugins,
  animated = true,
  transformTiming,
  spinTiming,
  opacityTiming,
  respectMotionPreference = true,
  digits,
  willChange = false,
  nonce,
  prefixContent,
  suffixContent,
  onAnimationsStart,
  onAnimationsFinish,
  ref,
  className,
  ...attrs
}: NumberFlowProps) {
  const cls = usePrefix('number-flow');
  const group = useContext(NumberFlowGroupContext);
  const scope = useId();
  const root = useRef<HTMLSpanElement>(null);
  const formatter = useMemo(() => new Intl.NumberFormat(locales, format), [locales, format]);
  const currentValue = sanitizeValue(value);
  const formatData = (input: number) =>
    formatNumberFlow(
      input,
      formatter,
      prefixContent != null ? undefined : prefix,
      suffixContent != null ? undefined : suffix,
    );
  const current = formatData(currentValue);
  const motionCanAnimate = useCanAnimate({ respectMotionPreference });
  const transformDuration = parseDuration(transformTiming?.duration, 900);
  const transformEasing = transformTiming?.easing?.toString() ?? 'cubic-bezier(0.16, 1, 0.3, 1)';
  const spinDuration = parseDuration(spinTiming?.duration, transformDuration);
  const spinEasing = spinTiming?.easing?.toString() ?? transformEasing;
  const opacityDuration = parseDuration(opacityTiming?.duration, 450);
  const canAnimate = animated && motionCanAnimate;
  const state = useRef({ previous: current, phase: 'idle' as NumberFlowPhase });
  const [, rerender] = useState(0);
  const live = useRef({
    current,
    plugins,
    trend,
    canAnimate,
    spinDuration,
    transformDuration,
    opacityDuration,
    onAnimationsStart,
    onAnimationsFinish,
  });
  live.current = {
    current,
    plugins,
    trend,
    canAnimate,
    spinDuration,
    transformDuration,
    opacityDuration,
    onAnimationsStart,
    onAnimationsFinish,
  };
  const [foundation] = useState(() =>
    createNumberFlow({
      get previous() {
        return state.current.previous;
      },
      set previous(next) {
        state.current.previous = next;
      },
      get current() {
        return live.current.current;
      },
      get phase() {
        return state.current.phase;
      },
      set phase(next) {
        state.current.phase = next;
        rerender((n) => n + 1);
      },
      get plugins() {
        return live.current.plugins;
      },
      get trend() {
        return getNumberFlowTrend(
          live.current.trend,
          state.current.previous.value,
          live.current.current.value,
        );
      },
      get canAnimate() {
        return live.current.canAnimate;
      },
      get spinDuration() {
        return live.current.spinDuration;
      },
      get transformDuration() {
        return live.current.transformDuration;
      },
      get opacityDuration() {
        return live.current.opacityDuration;
      },
      readLayout: () => {
        root.current?.getBoundingClientRect();
      },
      setTimer: (callback, delay) => setTimeout(callback, delay),
      clearTimer: (timer: ReturnType<typeof setTimeout> | undefined) => clearTimeout(timer),
      start: () => live.current.onAnimationsStart?.(),
      finish: () => live.current.onAnimationsFinish?.(),
    }),
  );
  const observed = useRef(currentValue);
  const version = useRef<number | undefined>(undefined);
  const phase = state.current.phase;
  useLayoutEffect(
    () =>
      group?.register({
        prepare: () => foundation.prepare(state.current.previous, live.current.current),
        commit: foundation.commit,
        start: foundation.start,
      }),
    [group, foundation],
  );
  useLayoutEffect(() => {
    if (observed.current === currentValue) return;
    const old = observed.current;
    observed.current = currentValue;
    if (group) group.schedule();
    else version.current = foundation.prepare(formatData(old), current);
  });
  useLayoutEffect(() => {
    if (
      !group &&
      phase === 'prepared' &&
      version.current !== undefined &&
      foundation.commit(version.current)
    )
      foundation.start(version.current);
  }, [phase, foundation, group]);
  useLayoutEffect(() => () => foundation.dispose(), [foundation]);
  useImperativeHandle(
    ref,
    () => ({
      get el() {
        return root.current;
      },
    }),
    [],
  );
  const digitFoundation = createNumberFlowDigits({
    previous: state.current.previous,
    current,
    phase,
    trend: getNumberFlowTrend(trend, state.current.previous.value, current.value),
    highestChangedPosition: getHighestChangedPosition(state.current.previous, current),
    digits,
    plugins,
  });
  const dynamicStyles = getNumberFlowStyles({
    scope,
    transformDuration,
    transformEasing,
    spinDuration,
    spinEasing,
    opacityDuration,
    parts: current.parts,
    delta: digitFoundation.delta,
  });
  return (
    <span
      {...attrs}
      ref={root}
      className={[
        cls,
        canAnimate && `${cls}-animated`,
        phase === 'prepared' && `${cls}-prepared`,
        phase === 'animating' && `${cls}-animating`,
        willChange && `${cls}-will-change`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-number-flow-id={scope}
      role="img"
      aria-label={current.valueAsString}
    >
      <style nonce={nonce}>{dynamicStyles}</style>
      {prefixContent != null && (
        <span className={`${cls}-custom-prefix`} aria-hidden="true">
          {prefixContent}
        </span>
      )}
      <span className={`${cls}-content`} aria-hidden="true">
        {current.parts.map((part, index) => (
          <span
            key={part.key}
            data-number-flow-part={index}
            className={[
              `${cls}-part`,
              `${cls}-${part.type}`,
              part.digit !== undefined && `${cls}-digit`,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {part.digit !== undefined ? (
              <span className={`${cls}-digit-track`}>
                {digitFoundation.sequence(part).map((digit) => (
                  <span key={digit.key} className={`${cls}-digit-value`}>
                    {digit.value}
                  </span>
                ))}
              </span>
            ) : (
              <span className={`${cls}-symbol`}>{part.value}</span>
            )}
          </span>
        ))}
      </span>
      {suffixContent != null && (
        <span className={`${cls}-custom-suffix`} aria-hidden="true">
          {suffixContent}
        </span>
      )}
    </span>
  );
}

export default NumberFlow;

export type NumberFlowGroupInstance = ReactComponentRef<typeof NumberFlowGroup>;
