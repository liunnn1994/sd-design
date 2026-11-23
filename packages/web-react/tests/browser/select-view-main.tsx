import { StrictMode } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import '@sdata/web-core/styles/style/index.scss';

import '../../styles/_shared/select-view.scss';
import { SelectViewFixture } from './select-view-fixture';

flushSync(() =>
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <SelectViewFixture />
    </StrictMode>,
  ),
);
