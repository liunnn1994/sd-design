import { StrictMode } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import '@sdata/web-core/styles/style/index.scss';

import '../../styles/clamp.scss';
import '../../styles/ellipsis.scss';
import { ClampFixture } from './clamp-fixture';
import { LineFixture } from './line-fixture';

flushSync(() =>
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ClampFixture />
      <LineFixture />
    </StrictMode>,
  ),
);
