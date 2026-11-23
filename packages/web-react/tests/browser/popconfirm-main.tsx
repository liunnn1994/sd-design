import { StrictMode } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import '@sdata/web-core/styles/style/index.scss';

import '../../styles/popconfirm.scss';
import { PopconfirmFixture } from './popconfirm-fixture';

flushSync(() =>
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <PopconfirmFixture />
    </StrictMode>,
  ),
);
