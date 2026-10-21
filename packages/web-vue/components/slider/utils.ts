import type { CSSProperties } from 'vue';

import { getPositionStyle as getCorePositionStyle } from '@sdata/web-core/slider/data';

import type { Direction } from '../_utils/constant';
export { getOffsetPercent } from '@sdata/web-core/slider/data';
export const getPositionStyle = (offset: string, direction: Direction): CSSProperties =>
  getCorePositionStyle(offset, direction);
