import type { Properties } from 'csstype';

import { COLORS, type ColorType } from './constants.js';

type BadgeStyle = Properties<string | number> & {
  [name: `--${string}`]: string | number | undefined;
};

export function getBadgeCount(count: number | undefined, maxCount: number) {
  const value = Math.max(Number(count) || 0, 0);
  const overflow = Boolean(maxCount && value > maxCount);
  return {
    hasCount: count != null,
    value,
    display: overflow ? maxCount : value,
    suffix: overflow ? '+' : undefined,
  };
}

export function getBadgeDotStyle(dotStyle: BadgeStyle | undefined, offset: number[], rtl: boolean) {
  const style: BadgeStyle = { ...dotStyle };
  const [leftOffset, topOffset] = offset;
  if (leftOffset) style[rtl ? 'marginLeft' : 'marginRight'] = `${-leftOffset}px`;
  if (topOffset) style.marginTop = `${topOffset}px`;
  return style;
}

export function getBadgeStyle<T extends Properties<string | number>>(
  color: string | undefined,
  dotStyle: T,
) {
  return {
    ...(!color || COLORS.includes(color as ColorType) ? {} : { backgroundColor: color }),
    ...dotStyle,
  };
}
