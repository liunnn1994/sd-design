import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import CascaderDemo, {
  CascaderMultipleDemo,
  CascaderPathDemo,
  CascaderLazyDemo,
  CascaderPanelDemo,
  CascaderCustomDemo,
} from './cascader-docs-fixture.js';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CascaderDemo />
    <CascaderMultipleDemo />
    <CascaderPathDemo />
    <CascaderLazyDemo />
    <CascaderPanelDemo />
    <CascaderCustomDemo />
  </StrictMode>,
);
