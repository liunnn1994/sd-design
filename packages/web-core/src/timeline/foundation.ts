import type { Direction } from '../_utils/constant.js';
import type { DotType, LabelPositionType, LineType, ModeType } from './types.js';

export interface TimelineState {
  items: number[];
  direction: Direction;
  reverse: boolean;
  labelPosition: LabelPositionType;
  mode: ModeType;
  hasPending: boolean;
}

export const hasTimelinePending = (pending: boolean | string | undefined, slot: unknown) =>
  Boolean(pending || slot);

export function getTimelinePosition(
  index: number,
  mode: ModeType,
  direction: Direction,
  position?: string,
) {
  const positions = direction === 'horizontal' ? ['top', 'bottom'] : ['left', 'right'];
  const result = mode === 'alternate' ? position || positions[index % 2] : mode;
  return positions.indexOf(result) > -1 ? result : positions[0];
}

export function getTimelineItemState(
  pending: boolean,
  id: number,
  context: Partial<TimelineState>,
  position?: string,
) {
  const { items = [], reverse, mode = 'left' } = context;
  const index = pending ? items.length : items.indexOf(id);
  const direction = context.direction ?? 'vertical';
  return {
    index,
    direction,
    position: getTimelinePosition(index, mode, direction, position),
    last: index === (reverse === true ? 0 : items.length - 1 + Number(context.hasPending)),
  };
}

export function getTimelineLineStyle(
  direction: Direction | undefined,
  lineType: LineType,
  color: string | undefined,
) {
  return {
    [direction === 'horizontal' ? 'borderTopStyle' : 'borderLeftStyle']: lineType,
    ...(color ? { borderColor: color } : {}),
  };
}

export function getTimelineDotStyle(type: DotType, color: string | undefined) {
  return { [type === 'solid' ? 'backgroundColor' : 'borderColor']: color };
}
