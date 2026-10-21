import type { ScrollPosition } from './types.js';

import { isNumber } from '../_utils/is.js';
export function createTabsNavigation(adapter: {
  readonly offset: number;
  readonly max: number;
  readonly scrolling: boolean;
  readonly wrapperLength: number;
  readonly rtl: boolean;
  hasElements(): boolean;
  measureOverflow(): boolean;
  measureWrapper(): number;
  measureMax(): number;
  setOffset(value: number): void;
  setScrolling(value: boolean): void;
  setWrapperLength(value: number): void;
  setMax(value: number): void;
}) {
  function measure() {
    adapter.setScrolling(adapter.measureOverflow());
    if (adapter.scrolling) {
      adapter.setWrapperLength(adapter.measureWrapper());
      adapter.setMax(adapter.measureMax());
      if (adapter.offset > adapter.max) adapter.setOffset(adapter.max);
    } else adapter.setOffset(0);
  }
  function setOffset(value: number) {
    if (!adapter.hasElements() || value < 0) value = 0;
    adapter.setOffset(Math.min(value, adapter.max));
  }
  function wheel(event: WheelEvent) {
    if (!adapter.scrolling) return;
    event.preventDefault();
    const { deltaX, deltaY } = event;
    setOffset(adapter.offset + (Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY));
  }
  function button(type: string) {
    const direction = (type === 'previous') !== adapter.rtl ? -1 : 1;
    setOffset(adapter.offset + direction * adapter.wrapperLength);
  }
  return { measure, setOffset, wheel, button };
}
export function getTabMarginSide(
  horizontal: boolean,
  rtl: boolean,
  position: ScrollPosition,
): 'marginLeft' | 'marginRight' | 'marginTop' | 'marginBottom' {
  return horizontal
    ? rtl
      ? position === 'end'
        ? 'marginLeft'
        : 'marginRight'
      : position === 'end'
        ? 'marginRight'
        : 'marginLeft'
    : position === 'end'
      ? 'marginBottom'
      : 'marginTop';
}
export function getTabTargetOffset(
  position: ScrollPosition,
  offset: number,
  tabPosition: number,
  tabSize: number,
  wrapperSize: number,
  margin: number,
) {
  let target = 0;
  switch (position) {
    case 'auto':
      if (tabPosition < offset) target = tabPosition - margin;
      else if (tabPosition + tabSize > offset + wrapperSize)
        target = tabPosition + tabSize - wrapperSize + margin;
      else target = offset;
      break;
    case 'center':
      target = tabPosition + (tabSize - wrapperSize + margin) / 2;
      break;
    case 'start':
      target = tabPosition - margin;
      break;
    case 'end':
      target = tabPosition + tabSize - wrapperSize + margin;
      break;
    default:
      if (isNumber(position)) target = tabPosition - position;
  }
  return target;
}
export function getTabsInkStyle(
  capsule: boolean | undefined,
  direction: 'horizontal' | 'vertical' | undefined,
  position: number,
  size: number,
) {
  if (capsule)
    return direction === 'vertical'
      ? { transform: `translateY(${position}px)`, height: `${size}px` }
      : { transform: `translateX(${position}px)`, width: `${size}px` };
  return direction === 'vertical'
    ? { top: `${position}px`, height: `${size}px` }
    : { left: `${position}px`, width: `${size}px` };
}
