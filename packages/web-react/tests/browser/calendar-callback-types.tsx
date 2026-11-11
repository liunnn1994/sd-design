import type { CalendarProps } from '@sdata/web-react/calendar';

// Compiled by the browser fixture type gate; callbacks must infer their public payloads.
export const calendarCallbackTypes = {
  onCellClick({ cell, cursor, view, e }) {
    cell.goNarrower();
    cursor.date.getTime();
    view.scrollToTime(600);
    e.preventDefault();
  },
  onEventCreate({ event, resolve, view }) {
    event.start.getTime();
    view.next();
    resolve({ ...event, title: 'Approved' });
    resolve(false);
    // @ts-expect-error Creation candidates have not been normalized into event instances.
    event.delete();
    // @ts-expect-error A replacement event must supply both dates.
    resolve({ title: 'Missing dates' });
  },
  async onEventDrop({ event, overlaps, cell, external }) {
    event.getOverlappingEvents();
    overlaps.map((item) => item._.id);
    cell.start.getTime();
    if (external) return false;
    return { title: 'Moved' };
  },
  onEventDropped({ originalEvent, event }) {
    originalEvent.start?.getTime();
    event?.start.getTime();
  },
  onEventResize({ event, overlaps }) {
    return event.start < event.end && overlaps.length === 0;
  },
  async onEventResizeEnd({ original, event }) {
    original?.start.getTime();
    return event.end > event.start;
  },
  onEventDragEnd({ e, event, external }) {
    e.dataTransfer?.getData('event');
    if (external) event.getOverlappingEvents();
  },
  onEventClick({ event, e }) {
    event.delete(1);
    e.preventDefault();
    // @ts-expect-error An event callback does not receive a cell view.
    event.goNarrower();
  },
} satisfies CalendarProps;
