import { StrictMode } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import '@sdata/web-core/styles/style/index.scss';

import '../../styles/button.scss';
import '../../styles/avatar.scss';
import '../../styles/card.scss';
import { CardFixture } from './card-fixture';

flushSync(() =>
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <CardFixture />
    </StrictMode>,
  ),
);
