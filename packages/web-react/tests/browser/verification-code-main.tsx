import { StrictMode } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';

import '../../styles/form.scss';
import '../../styles/verification-code.scss';
import { VerificationCodeFixture } from './verification-code-fixture';

flushSync(() =>
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <VerificationCodeFixture />
    </StrictMode>,
  ),
);
