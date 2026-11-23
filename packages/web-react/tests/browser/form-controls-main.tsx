import { StrictMode } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';

import { AutoCompleteFixture } from './auto-complete-fixture';
import { ChoiceFixture } from './choice-fixture';
import { MentionFixture } from './mention-fixture';
import { RateFixture } from './rate-fixture';
import { SliderFixture } from './slider-fixture';
import { TextareaFixture } from './textarea-fixture';
import './style.scss';

flushSync(() =>
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <MentionFixture />
      <AutoCompleteFixture />
      <SliderFixture />
      <RateFixture />
      <ChoiceFixture />
      <TextareaFixture />
    </StrictMode>,
  ),
);
