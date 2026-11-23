import { StrictMode } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import '@sdata/web-core/styles/style/index.scss';

import '../../styles/_shared/virtual-list.scss';
import '../../styles/clamp.scss';
import { VirtualListFixture } from './virtual-list-fixture';
import { WrapFixture } from './wrap-fixture';

flushSync(() =>
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <VirtualListFixture />
      <WrapFixture />
    </StrictMode>,
  ),
);
