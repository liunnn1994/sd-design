import type { CSSProperties } from 'vue';

import { Direction } from '../_utils/constant';

export const getOffsetPercent = (value: number, [min, max]: [number, number]): string => {
  const percent = Math.max((value - min) / (max - min), 0);
  return `${Math.round(percent * 10_000) / 100}%`;
};

export const getPositionStyle = (offset: string, direction: Direction): CSSProperties => {
  return direction === 'vertical' ? { bottom: offset } : { left: offset };
};
