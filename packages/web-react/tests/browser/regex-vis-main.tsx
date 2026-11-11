import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '../../styles/regex-vis.scss';
import { RegexVisFixture, RegexVisPatternFixture } from './regex-vis-fixture';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {new URLSearchParams(location.search).has('pattern') ? (
      <RegexVisPatternFixture />
    ) : (
      <RegexVisFixture />
    )}
  </StrictMode>,
);
