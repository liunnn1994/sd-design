import { StrictMode } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import '@sdata/web-core/styles/style/index.scss';

import '../../styles/message.scss';
import '../../styles/notification.scss';
import { NoticeFixture } from './notice-fixture';

flushSync(() =>
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <NoticeFixture />
    </StrictMode>,
  ),
);
