import { StrictMode } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';

import '../../styles/button.scss';
import '../../styles/layout.scss';
import { LayoutFixture } from './layout-fixture';

flushSync(() =>
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <LayoutFixture />
    </StrictMode>,
  ),
);
