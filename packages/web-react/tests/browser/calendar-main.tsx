import React from 'react';
import { createRoot } from 'react-dom/client';

import '../../styles/calendar.scss';
import { CalendarAdapterFixture } from './calendar-adapter-fixture';
import { CalendarApprovalLifecycleFixture } from './calendar-approval-lifecycle-fixture';
import { CalendarBodyFixture } from './calendar-body-fixture';
import { CalendarCellFixture } from './calendar-cell-fixture';
import { CalendarCellViewFixture } from './calendar-cell-view-fixture';
import { CalendarDragFixture } from './calendar-drag-fixture';
import { CalendarEventFixture } from './calendar-event-fixture';
import { CalendarEventsFixture } from './calendar-events-fixture';
import { CalendarHeaderFixture } from './calendar-header-fixture';
import { CalendarHeadingsFixture } from './calendar-headings-fixture';
import { CalendarLocaleRootFixture } from './calendar-locale-root-fixture';
import { CalendarPropBoundariesFixture } from './calendar-prop-boundaries-fixture';
import { CalendarResizeLifecycleFixture } from './calendar-resize-lifecycle-fixture';
import { CalendarSpecialHoursFixture } from './calendar-special-hours-fixture';
import { CalendarTextsFixture } from './calendar-texts-fixture';
import { CalendarTimeFixture } from './calendar-time-fixture';
import { CalendarViewFixture } from './calendar-view-fixture';
const fixtures: Record<string, React.ComponentType> = {
  'approval-lifecycle': CalendarApprovalLifecycleFixture,
  'prop-boundaries': CalendarPropBoundariesFixture,
  'resize-lifecycle': CalendarResizeLifecycleFixture,
  'special-hours': CalendarSpecialHoursFixture,
  'locale-root': CalendarLocaleRootFixture,
  'adapter': CalendarAdapterFixture,
  'body': CalendarBodyFixture,
  'cell': CalendarCellFixture,
  'cell-view': CalendarCellViewFixture,
  'drag': CalendarDragFixture,
  'event': CalendarEventFixture,
  'events': CalendarEventsFixture,
  'header': CalendarHeaderFixture,
  'headings': CalendarHeadingsFixture,
  'texts': CalendarTextsFixture,
  'time': CalendarTimeFixture,
  'view': CalendarViewFixture,
};
const Fixture = fixtures[new URLSearchParams(location.search).get('fixture') ?? 'adapter'];
if (!Fixture) throw new Error('Unknown Calendar fixture');
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Fixture />
  </React.StrictMode>,
);
