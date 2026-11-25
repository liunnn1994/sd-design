import type { Size, Status } from '@sdata/web-core/_utils/constant';
import type { ProgressType } from '@sdata/web-core/progress/foundation';
import type { ComponentPropsWithRef, CSSProperties, ReactNode } from 'react';

import {
  createProgressFoundation,
  createProgressLineFoundation,
  createProgressCircleFoundation,
  createProgressStepsFoundation,
  getProgressPercent,
  getProgressText,
} from '@sdata/web-core/progress/foundation';
import { useId } from 'react';

import { useConfig, usePrefix } from '../config-provider/index.js';

export type { ProgressType };
export interface ProgressProps extends Omit<ComponentPropsWithRef<'div'>, 'children' | 'color'> {
  type?: ProgressType;
  size?: Size;
  percent?: number | undefined;
  steps?: number;
  animation?: boolean;
  strokeWidth?: number;
  width?: number | string;
  color?: string | Record<string, unknown>;
  trackColor?: string;
  bufferColor?: string | Record<string, unknown>;
  showText?: boolean;
  status?: Status;
  text?: ReactNode | ((context: { percent: number }) => ReactNode);
}
export type ProgressInstance = HTMLDivElement;

function StatusIcon({
  kind,
  style,
}: {
  kind: 'check' | 'exclamation' | 'exclamation-circle-fill';
  style?: CSSProperties;
}) {
  const cls = usePrefix('icon');
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={4}
      className={`${cls} ${cls}-${kind}`}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      {kind === 'check' ? (
        <path d="M41.678 11.05 19.05 33.678 6.322 20.95" />
      ) : kind === 'exclamation' ? (
        <>
          <path d="M23 9h2v21h-2z" />
          <path fill="currentColor" stroke="none" d="M23 9h2v21h-2z" />
          <path d="M23 37h2v2h-2z" />
          <path fill="currentColor" stroke="none" d="M23 37h2v2h-2z" />
        </>
      ) : (
        <path
          fill="currentColor"
          fillRule="evenodd"
          stroke="none"
          clipRule="evenodd"
          d="M24 44c11.046 0 20-8.954 20-20S35.046 4 24 4 4 12.954 4 24s8.954 20 20 20m-2-11a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1zm4-18a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1z"
        />
      )}
    </svg>
  );
}

export function Progress({
  type = 'line',
  size: providedSize,
  percent = 0,
  steps = 0,
  animation = false,
  strokeWidth,
  width,
  color,
  trackColor,
  bufferColor: _bufferColor,
  showText = true,
  status,
  text,
  className,
  ...attrs
}: ProgressProps) {
  const cls = usePrefix('progress');
  const config = useConfig();
  const size = providedSize ?? config.size ?? 'medium';
  const id = `${cls}-linear-gradient-${useId()}`;
  const foundation = createProgressFoundation({ type, steps, percent, status, width, strokeWidth });
  const mode = foundation.getType();
  const resolvedStatus = foundation.getStatus();
  const aria = {
    'role': 'progressbar',
    'aria-valuemin': 0,
    'aria-valuemax': 100,
    'aria-valuenow': getProgressPercent(percent),
  };
  const customText = () => (typeof text === 'function' ? text({ percent }) : text);
  const regularText = (
    <>
      {getProgressText(percent)}
      {resolvedStatus === 'danger' && <StatusIcon kind="exclamation-circle-fill" />}
    </>
  );
  let content: ReactNode;
  if (steps > 0) {
    const api = createProgressStepsFoundation({
      steps,
      percent,
      size,
      strokeWidth,
      color,
      trackColor,
    });
    content = (
      <div {...aria} className={`${cls}-steps-wrapper`}>
        <div className={`${cls}-steps`} style={{ height: `${api.getStrokeWidth()}px` }}>
          {api.getSteps().map((active, index) => (
            <div
              key={index}
              className={[`${cls}-steps-item`, active && `${cls}-steps-item-active`]
                .filter(Boolean)
                .join(' ')}
              style={api.getStepStyle(active)}
            />
          ))}
        </div>
        {showText && (
          <div className={`${cls}-steps-text`}>
            {text === undefined ? regularText : customText()}
          </div>
        )}
      </div>
    );
  } else if (mode === 'line' && size !== 'mini') {
    const api = createProgressLineFoundation({
      size,
      strokeWidth,
      percent,
      width: width ?? '100%',
      color,
      trackColor,
    });
    content = (
      <div {...aria} className={`${cls}-line-wrapper`}>
        <div className={`${cls}-line`} style={api.getStyle()}>
          <div className={`${cls}-line-bar-buffer`} />
          <div
            className={[`${cls}-line-bar`, animation && `${cls}-line-bar-animate`]
              .filter(Boolean)
              .join(' ')}
            style={api.getBarStyle()}
          />
        </div>
        {showText && (
          <div className={`${cls}-line-text`}>
            {text === undefined ? regularText : customText()}
          </div>
        )}
      </div>
    );
  } else {
    const circleStrokeWidth = foundation.getCircleStrokeWidth();
    const api = createProgressCircleFoundation(
      {
        size,
        width: foundation.getCircleWidth(),
        strokeWidth: circleStrokeWidth,
        pathStrokeWidth: circleStrokeWidth,
        percent,
        color,
        trackColor,
      },
      () => id,
    );
    const w = api.getWidth();
    content = (
      <div
        {...aria}
        className={`${cls}-circle-wrapper`}
        style={{ width: `${w}px`, height: `${w}px` }}
      >
        {mode === 'circle' && size === 'mini' && resolvedStatus === 'success' ? (
          <StatusIcon kind="check" style={api.getIconStyle()} />
        ) : (
          <svg viewBox={`0 0 ${w} ${w}`} className={`${cls}-circle-svg`}>
            {api.isLinearGradient() && (
              <defs>
                <linearGradient id={id} x1="0" y1="1" x2="0" y2="0">
                  {api.getGradientStops().map(([offset, stopColor]) => (
                    <stop key={offset} offset={offset} stopColor={stopColor} />
                  ))}
                </linearGradient>
              </defs>
            )}
            <circle
              className={`${cls}-circle-bg`}
              fill="none"
              cx={api.getCenter()}
              cy={api.getCenter()}
              r={api.getRadius()}
              strokeWidth={api.getPathStrokeWidth()}
              style={api.getTrackStyle()}
            />
            <circle
              className={`${cls}-circle-bar`}
              fill="none"
              cx={api.getCenter()}
              cy={api.getCenter()}
              r={api.getRadius()}
              strokeWidth={api.getStrokeWidth()}
              style={api.getCircleStyle()}
            />
          </svg>
        )}
        {showText && size !== 'mini' && (
          <div className={`${cls}-circle-text`}>
            {text !== undefined ? (
              customText()
            ) : resolvedStatus === 'danger' ? (
              <StatusIcon kind="exclamation" />
            ) : resolvedStatus === 'success' ? (
              <StatusIcon kind="check" />
            ) : (
              getProgressText(percent)
            )}
          </div>
        )}
      </div>
    );
  }
  return (
    <div
      {...attrs}
      className={[
        cls,
        `${cls}-type-${mode}`,
        `${cls}-size-${size}`,
        `${cls}-status-${resolvedStatus}`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {content}
    </div>
  );
}
export default Progress;
