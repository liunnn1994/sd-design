import { StrictMode } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import '@sdata/web-core/styles/style/index.scss';

import '../../styles/carousel.scss';
import '../../styles/button.scss';
import { CarouselFixture } from './carousel-fixture';

flushSync(() =>
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <CarouselFixture />
    </StrictMode>,
  ),
);
