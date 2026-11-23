import { StrictMode } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import '@sdata/web-core/styles/style/index.scss';

import '../../styles/voice-glow.scss';
import { VoiceGlowFixture } from './voice-glow-fixture';

flushSync(() =>
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <VoiceGlowFixture />
    </StrictMode>,
  ),
);
