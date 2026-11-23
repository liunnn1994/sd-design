import { StrictMode } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import '@sdata/web-core/styles/style/index.scss';

import '../../styles/liquid-glass-logo.scss';
import { LiquidGlassLogoFixture } from './liquid-glass-logo-fixture';

flushSync(() =>
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <div style={{ height: '100vh' }} />
      <LiquidGlassLogoFixture />
    </StrictMode>,
  ),
);
