import { StrictMode } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';

import '../../styles/button.scss';
import '../../styles/form.scss';
import '../../styles/switch.scss';
import { FormFixture } from './form-fixture';

flushSync(() =>
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <FormFixture />
    </StrictMode>,
  ),
);
