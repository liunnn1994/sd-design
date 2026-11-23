import { StrictMode } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import '@sdata/web-core/styles/style/index.scss';

import '../../styles/drawer.scss';
import '../../styles/modal.scss';
import { ModalFixture } from './modal-fixture';

flushSync(() =>
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ModalFixture />
    </StrictMode>,
  ),
);
