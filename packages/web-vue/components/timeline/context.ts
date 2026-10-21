import type { TimelineState } from '@sdata/web-core/timeline/foundation';

import type { InjectionKey } from 'vue';
export interface TimelineContext extends TimelineState {}
export const timelineInjectionKey: InjectionKey<TimelineContext> = Symbol('SDTimeline');
