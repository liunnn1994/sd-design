import { isArray, isNumber } from '../_utils/is.js';
export type SpaceSize = number | 'mini' | 'small' | 'medium' | 'large';
export interface SpaceState {
  readonly size: SpaceSize | [SpaceSize, SpaceSize];
  readonly align?: 'start' | 'end' | 'center' | 'baseline' | undefined;
  readonly direction: 'horizontal' | 'vertical';
}
export function getSize(value: SpaceSize) {
  if (isNumber(value)) {
    return value;
  }

  switch (value) {
    case 'mini':
      return 4;
    case 'small':
      return 8;
    case 'medium':
      return 16;
    case 'large':
      return 24;
    default:
      return 8;
  }
}
export function getSpaceStyle(state: Pick<SpaceState, 'size'>) {
  const sizeArray = isArray(state.size) ? state.size : [state.size, state.size];
  const [columnGap, rowGap] = sizeArray.map(getSize);

  return {
    columnGap: `${columnGap}px`,
    rowGap: `${rowGap}px`,
  };
}
export function getSpaceAlign(state: Pick<SpaceState, 'align' | 'direction'>) {
  return state.align ?? (state.direction === 'horizontal' ? 'center' : '');
}
