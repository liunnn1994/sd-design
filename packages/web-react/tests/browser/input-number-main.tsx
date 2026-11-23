import { StrictMode } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import '@sdata/web-core/styles/style/index.scss';

import '../../styles/form.scss';
import '../../styles/input-number.scss';
import { InputNumberFixture } from './input-number-fixture';

flushSync(() =>
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <InputNumberFixture />
    </StrictMode>,
  ),
);
