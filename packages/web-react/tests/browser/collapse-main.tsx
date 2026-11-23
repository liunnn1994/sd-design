import { StrictMode } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import '@sdata/web-core/styles/style/index.scss';

import '../../styles/collapse.scss';
import '../../styles/button.scss';
import { CollapseFixture } from './collapse-fixture';

flushSync(() =>
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <CollapseFixture />
    </StrictMode>,
  ),
);
