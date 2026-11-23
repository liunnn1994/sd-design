import { StrictMode } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import '@sdata/web-core/styles/style/index.scss';

import '../../styles/trigger.scss';
import { FloatingFixture } from './floating-fixture';
import { TriggerFixture, TriggerScrollFixture } from './trigger-fixture';

const scrollLifecycle = new URLSearchParams(location.search).has('scroll-lifecycle');

flushSync(() =>
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      {scrollLifecycle ? (
        <TriggerScrollFixture />
      ) : (
        <>
          <FloatingFixture />
          <TriggerFixture />
        </>
      )}
    </StrictMode>,
  ),
);
