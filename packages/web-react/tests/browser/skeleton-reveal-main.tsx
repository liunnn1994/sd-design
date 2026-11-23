import { StrictMode } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import '@sdata/web-core/styles/style/index.scss';

import '../../styles/skeleton-reveal.scss';
import { SkeletonRevealFixture } from './skeleton-reveal-fixture';

flushSync(() =>
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <SkeletonRevealFixture />
    </StrictMode>,
  ),
);
