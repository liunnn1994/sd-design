import { StrictMode } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import '@sdata/web-core/styles/style/index.scss';

import '../../styles/copy.scss';
import '../../styles/secret.scss';
import { CopySecretFixture } from './copy-secret-fixture';

flushSync(() =>
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <CopySecretFixture />
    </StrictMode>,
  ),
);
