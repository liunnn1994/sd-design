import { StrictMode } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';

import { KvListFixture } from './kv-list-fixture';
import './style.scss';

flushSync(() =>
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <KvListFixture />
    </StrictMode>,
  ),
);
