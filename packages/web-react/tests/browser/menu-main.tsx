import { StrictMode } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import '@sdata/web-core/styles/style/index.scss';

import '../../styles/menu.scss';
import { MenuCollectorFixture } from './menu-collector-fixture';
import { MenuFixture } from './menu-fixture';

flushSync(() =>
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <MenuCollectorFixture />
      <MenuFixture />
    </StrictMode>,
  ),
);
