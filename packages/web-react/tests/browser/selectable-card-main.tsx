import { StrictMode } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import '@sdata/web-core/styles/style/index.scss';

import '../../styles/selectable-card.scss';
import { SelectableCardFixture } from './selectable-card-fixture';

flushSync(() =>
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <SelectableCardFixture />
    </StrictMode>,
  ),
);
