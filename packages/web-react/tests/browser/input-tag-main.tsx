import { StrictMode } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import '@sdata/web-core/styles/style/index.scss';

import '../../styles/form.scss';
import '../../styles/input-tag.scss';
import { InputTagFixture } from './input-tag-fixture';

flushSync(() =>
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <InputTagFixture />
    </StrictMode>,
  ),
);
