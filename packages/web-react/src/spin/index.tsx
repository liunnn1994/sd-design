import type { ComponentRef as ReactComponentRef } from 'react';
import type { ComponentPropsWithRef, ReactNode } from 'react';

import {
  getSpinDelay,
  isSpinRequested,
  scheduleSpinLoading,
} from '@sdata/web-core/spin/foundation';
import { cloneElement, isValidElement, useEffect, useState } from 'react';

import { LoadingIcon } from '../_shared/loading-icon.js';
import { useConfig, usePrefix } from '../config-provider/index.js';

export interface SpinProps extends ComponentPropsWithRef<'div'> {
  size?: number;
  loading?: boolean;
  delay?: boolean | number;
  dot?: boolean;
  tip?: ReactNode;
  hideIcon?: boolean;
  icon?: ReactNode;
  element?: ReactNode;
}

export function Spin(props: SpinProps) {
  const config = useConfig();
  const {
    size,
    loading,
    delay,
    dot,
    tip,
    hideIcon,
    icon,
    element,
    children,
    className,
    ...attributes
  } = { ...config.spinProps, ...props };
  const prefix = usePrefix('spin');
  const dotPrefix = usePrefix('dot-loading');
  const iconPrefix = usePrefix('icon');
  const hasContent = children !== undefined && children !== null;
  const requested = isSpinRequested(hasContent, loading);
  const delayTime = getSpinDelay(delay);
  const [delayed, setDelayed] = useState(false);
  useEffect(() => scheduleSpinLoading(requested, delayTime, setDelayed), [requested, delayTime]);
  const active = requested && (delayTime === 0 || delayed);
  const custom = isValidElement<{ className?: string; spin?: boolean }>(icon)
    ? cloneElement(icon, {
        className: [icon.props.className, `${iconPrefix}-spin`].filter(Boolean).join(' '),
        ...(typeof icon.type === 'string' ? {} : { spin: true }),
      })
    : icon;
  const indicator = (
    <>
      {!hideIcon && (
        <div
          className={`${prefix}-icon`}
          style={size ? { fontSize: `${size}px` } : undefined}
          aria-hidden="true"
        >
          {custom ??
            element ??
            (dot ? (
              <div
                className={dotPrefix}
                style={size ? { width: size * 7, height: size } : undefined}
              >
                {[0, 1, 2, 3, 4].map((index) => (
                  <div
                    key={index}
                    className={`${dotPrefix}-item`}
                    style={size ? { width: size, height: size } : undefined}
                  />
                ))}
              </div>
            ) : (
              (config.renderLoading?.() ?? <LoadingIcon spin />)
            ))}
        </div>
      )}
      {tip && <div className={`${prefix}-tip`}>{tip}</div>}
    </>
  );
  return (
    <div
      {...attributes}
      role="status"
      aria-live="polite"
      aria-busy={active || undefined}
      className={[
        prefix,
        active && `${prefix}-loading`,
        tip && !hasContent && `${prefix}-with-tip`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
      {active &&
        (hasContent ? (
          <div className={`${prefix}-mask`}>
            <div className={`${prefix}-mask-icon`}>{indicator}</div>
          </div>
        ) : (
          indicator
        ))}
    </div>
  );
}

export default Spin;

export type SpinInstance = ReactComponentRef<typeof Spin>;
