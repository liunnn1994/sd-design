import { StrictMode } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import '@sdata/web-core/styles/style/index.scss';

import '../../styles/form.scss';
import '../../styles/select.scss';
import { SelectFixture } from './select-fixture';

flushSync(() =>
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <SelectFixture />
    </StrictMode>,
  ),
);
