import { StrictMode } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';

import '../../styles/bloom-menu.scss';
import { BloomMenuFixture } from './bloom-menu-fixture';

flushSync(() =>
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <BloomMenuFixture />
    </StrictMode>,
  ),
);
