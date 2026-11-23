import { StrictMode } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import '@sdata/web-core/styles/style/index.scss';

import '../../styles/calendar.scss';
import { CalendarIndexFixture, CalendarRootFixture } from './calendar-root-fixture';

const Fixture = new URLSearchParams(location.search).has('index')
  ? CalendarIndexFixture
  : CalendarRootFixture;

flushSync(() =>
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <Fixture />
    </StrictMode>,
  ),
);
