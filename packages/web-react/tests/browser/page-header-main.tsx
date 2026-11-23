import { StrictMode } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import '@sdata/web-core/styles/style/index.scss';

import '../../styles/button.scss';
import '../../styles/page-header.scss';
import { PageHeaderFixture } from './page-header-fixture';

flushSync(() =>
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <PageHeaderFixture />
    </StrictMode>,
  ),
);
