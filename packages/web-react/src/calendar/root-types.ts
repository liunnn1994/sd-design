import type { CalendarCellAdapter } from '@sdata/web-core/calendar/cell-interaction';
import type {
  CalendarEventInteraction,
  CalendarEventDragEnd,
  CalendarEventResize,
  CalendarEventResizeEnd,
  CalendarEventDrop,
  CalendarEventDropped,
} from '@sdata/web-core/calendar/types';
import type { ComponentPropsWithoutRef, ReactNode, Ref } from 'react';

import type { CalendarBodyProps } from './body.js';
import type { CalendarCellRenderParams } from './cell.js';
import type { CalendarHeaderProps } from './header.js';
import type { CalendarHeadingsProps } from './headings.js';
import type { CalendarTimeColumnProps } from './time-column.js';
import type { CalendarEvent, CalendarEventInput, CalendarOptions } from './types.js';
import type { useCalendar } from './use-calendar.js';

export type CalendarState = Omit<ReturnType<typeof useCalendar>, 'controller'>;
export type CalendarView = CalendarState['view'];
export interface CalendarExposed {
  view: CalendarView;
}
export interface CalendarCellInteraction<E extends Event = Event> {
  e: E;
  cell: CalendarCellRenderParams['cell'];
  cursor: { x?: number; y?: number; date: Date };
  view: CalendarView;
}
export interface CalendarEventCreate extends Omit<CalendarCellInteraction, 'e'> {
  e: MouseEvent | TouchEvent;
  event: Omit<CalendarCellAdapter['placeholder'], 'start' | 'end'> &
    CalendarEventInput & { start: Date; end: Date };
  resolve(result: boolean | CalendarEventInput): void;
}
type Callback = { bivarianceHack(payload: unknown): unknown }['bivarianceHack'];
type Approval = boolean | Partial<CalendarEventInput> | void;
export type CalendarViewChange = Pick<
  CalendarView,
  | 'id'
  | 'title'
  | 'start'
  | 'end'
  | 'extendedStart'
  | 'extendedEnd'
  | 'cellDates'
  | 'containsToday'
  | 'events'
>;
export interface CalendarProps
  extends
    CalendarOptions,
    Omit<ComponentPropsWithoutRef<'div'>, keyof CalendarOptions | 'children'>,
    Omit<CalendarBodyProps, 'calendar' | 'className' | 'style'>,
    Pick<CalendarHeadingsProps, 'renderWeekdayHeading' | 'renderScheduleHeading'>,
    Pick<CalendarHeaderProps, 'previousButton' | 'nextButton' | 'renderTodayButton'>,
    Pick<CalendarTimeColumnProps, 'allDayLabel' | 'renderTimeCell' | 'renderCurrentTimeLabel'> {
  ref?: Ref<CalendarExposed>;
  renderDiy?: (calendar: CalendarState) => ReactNode;
  renderHeader?: (params: {
    view: CalendarView;
    calendar: CalendarState;
    availableViews: CalendarState['config']['availableViews'];
  }) => ReactNode;
  renderTitle?: (view: CalendarView) => ReactNode;
  renderViewTitle?: Record<string, (view: CalendarView) => ReactNode>;
  renderWeekNumber?: (week: number) => ReactNode;
  onReady?: (params: { config: CalendarState['config']; view: CalendarView }) => void;
  onViewChange?: (view: CalendarViewChange) => void;
  onUpdateView?: (view: string) => void;
  onUpdateViewDate?: (date: Date) => void;
  onUpdateSelectedDate?: (date: Date) => void;
  onUpdateEvents?: (events: CalendarEvent[]) => void;
  onEventCreated?: (event: CalendarEvent) => void;
  onEventDelete?: (event: CalendarEvent) => void;
  onEventCreate?: (payload: CalendarEventCreate) => void;
  onEventDrop?: (payload: CalendarEventDrop) => Approval | Promise<Approval>;
  onEventDropped?: (payload: CalendarEventDropped) => void;
  onEventDragStart?: (payload: CalendarEventInteraction<DragEvent>) => void;
  onEventDragEnd?: (payload: CalendarEventDragEnd) => void;
  onEventResizeStart?: (payload: CalendarEventInteraction<MouseEvent | TouchEvent>) => void;
  onEventResize?: (payload: CalendarEventResize) => Approval | Promise<Approval>;
  onEventResizeEnd?: (payload: CalendarEventResizeEnd) => Approval | Promise<Approval>;
  onEventClick?: (payload: CalendarEventInteraction<MouseEvent | TouchEvent>) => void;
  onEventDblclick?: (payload: CalendarEventInteraction<MouseEvent | TouchEvent>) => void;
  onEventDelayedClick?: (payload: CalendarEventInteraction<MouseEvent | TouchEvent>) => void;
  onEventHold?: (payload: CalendarEventInteraction<MouseEvent | TouchEvent>) => void;
  onCellClick?: (payload: CalendarCellInteraction<MouseEvent | TouchEvent>) => void;
  onCellDblclick?: (payload: CalendarCellInteraction<MouseEvent | TouchEvent>) => void;
  onCellDelayedClick?: (payload: CalendarCellInteraction<MouseEvent | TouchEvent>) => void;
  onCellHold?: (payload: CalendarCellInteraction<MouseEvent | TouchEvent>) => void;
  [name: `onCell${string}`]: Callback | undefined;
  [name: `onEvent${string}`]: Callback | undefined;
}
