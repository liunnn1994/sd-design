import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { Select } from '../../src/select/index';
import './style.scss';
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Select options={['Alpha', 'Beta']} />
  </StrictMode>,
);
