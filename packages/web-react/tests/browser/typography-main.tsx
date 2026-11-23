import { StrictMode } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';

import '../../styles/typography.scss';
import { TypographyFixture } from './typography-fixture';

flushSync(() =>
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <TypographyFixture />
    </StrictMode>,
  ),
);
