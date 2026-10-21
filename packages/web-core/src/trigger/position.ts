import type { Properties } from 'csstype';

import type { TriggerPosition } from '../_utils/constant.js';
export type TriggerPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end';
export type TriggerPopupTranslate =
  | [number, number]
  | { [key in TriggerPosition]?: [number, number] };
export const toFloatingPlacement = (position: TriggerPosition): TriggerPlacement => {
  const map: Record<TriggerPosition, TriggerPlacement> = {
    top: 'top',
    tl: 'top-start',
    tr: 'top-end',
    bottom: 'bottom',
    bl: 'bottom-start',
    br: 'bottom-end',
    left: 'left',
    lt: 'left-start',
    lb: 'left-end',
    right: 'right',
    rt: 'right-start',
    rb: 'right-end',
  };
  return map[position];
};
export const fromFloatingPlacement = (placement: TriggerPlacement): TriggerPosition => {
  const map: Record<TriggerPlacement, TriggerPosition> = {
    'top': 'top',
    'top-start': 'tl',
    'top-end': 'tr',
    'bottom': 'bottom',
    'bottom-start': 'bl',
    'bottom-end': 'br',
    'left': 'left',
    'left-start': 'lt',
    'left-end': 'lb',
    'right': 'right',
    'right-start': 'rt',
    'right-end': 'rb',
  };
  return map[placement];
};
export function getArrowFloatingStyle(
  placement: TriggerPlacement,
  data: { x?: number; y?: number } | undefined,
): Pick<Properties<string | number>, 'left' | 'top' | 'right' | 'bottom' | 'transform'> {
  const side = placement.split('-')[0] as 'top' | 'right' | 'bottom' | 'left';
  const staticSide = { top: 'bottom', right: 'left', bottom: 'top', left: 'right' }[side];
  const transforms = {
    top: 'translateY(50%) rotate(45deg)',
    right: 'translateX(-50%) rotate(45deg)',
    bottom: 'translateY(-50%) rotate(45deg)',
    left: 'translateX(50%) rotate(45deg)',
  };
  return {
    left: data?.x == null ? undefined : `${data.x}px`,
    top: data?.y == null ? undefined : `${data.y}px`,
    [staticSide]: 0,
    transform: transforms[side],
  };
}
