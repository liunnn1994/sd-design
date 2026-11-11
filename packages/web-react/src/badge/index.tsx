import type { BadgeStatus } from '@sdata/web-core/badge/constants';
import type { ComponentRef as ReactComponentRef } from 'react';
import type { ComponentPropsWithRef, CSSProperties, ReactNode } from 'react';

import { getBadgeCount, getBadgeDotStyle, getBadgeStyle } from '@sdata/web-core/badge/foundation';

import { useConfig, usePrefix } from '../config-provider/index.js';
import { NumberFlow } from '../number-flow/index.js';

export interface BadgeProps extends Omit<ComponentPropsWithRef<'span'>, 'content'> {
  text?: string;
  dot?: boolean;
  dotStyle?: CSSProperties;
  maxCount?: number;
  offset?: number[];
  color?: string;
  status?: BadgeStatus;
  count?: number;
  animation?: boolean;
  content?: ReactNode;
}

export function Badge({
  text,
  dot = false,
  dotStyle,
  maxCount = 99,
  offset = [],
  color,
  status,
  count,
  animation = true,
  content,
  children,
  className,
  ...attrs
}: BadgeProps) {
  const prefix = usePrefix('badge');
  const { rtl } = useConfig();
  const number = getBadgeCount(count, maxCount);
  const computedDotStyle = getBadgeDotStyle({ ...dotStyle }, offset, !!rtl);
  const mergedStyle = getBadgeStyle(color, computedDotStyle);
  const numberContent = (
    <span className={`${prefix}-number`} style={mergedStyle}>
      <NumberFlow value={number.display} suffix={number.suffix} animated={animation} />
    </span>
  );
  return (
    <span
      {...attrs}
      className={[
        prefix,
        status && `${prefix}-status`,
        children == null && `${prefix}-no-children`,
        rtl && `${prefix}-rtl`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
      {content != null ? (
        <span className={`${prefix}-custom-dot`} style={computedDotStyle}>
          {content}
        </span>
      ) : text && !color && !status ? (
        <span className={`${prefix}-text`} style={computedDotStyle}>
          {text}
        </span>
      ) : status || (color && !number.hasCount) ? (
        <span className={`${prefix}-status-wrapper`}>
          <span
            className={[
              `${prefix}-status-dot`,
              status && `${prefix}-status-${status}`,
              color && `${prefix}-color-${color}`,
            ]
              .filter(Boolean)
              .join(' ')}
            style={mergedStyle}
            aria-hidden="true"
          />
          {text && <span className={`${prefix}-status-text`}>{text}</span>}
        </span>
      ) : (dot || color) && number.value > 0 ? (
        <span
          role="status"
          aria-label={String(number.value)}
          className={[`${prefix}-dot`, color && `${prefix}-color-${color}`]
            .filter(Boolean)
            .join(' ')}
          style={mergedStyle}
        />
      ) : number.value !== 0 ? (
        numberContent
      ) : null}
      {content == null && status && number.value > 0 && numberContent}
    </span>
  );
}

export default Badge;

export type BadgeInstance = ReactComponentRef<typeof Badge>;
