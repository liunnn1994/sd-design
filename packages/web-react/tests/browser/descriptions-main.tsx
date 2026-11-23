import { StrictMode } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import '@sdata/web-core/styles/style/index.scss';

import '../../styles/button.scss';
import '../../styles/descriptions.scss';
import { DescriptionsFixture } from './descriptions-fixture';

flushSync(() =>
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <DescriptionsFixture />
    </StrictMode>,
  ),
);
