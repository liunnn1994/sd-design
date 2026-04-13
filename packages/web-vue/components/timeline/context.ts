import { InjectionKey } from 'vue';

import type { ModeType, LabelPositionType } from './interface';

import { Direction } from '../_utils/constant';

export interface TimelineContext {
  items: number[];
  direction: Direction;
  reverse: boolean;
  labelPosition: LabelPositionType;
  mode: ModeType;
}

export const timelineInjectionKey: InjectionKey<TimelineContext> = Symbol('SDTimeline');
