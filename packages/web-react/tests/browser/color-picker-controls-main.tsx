import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '../../styles/color-picker.scss';
import { ColorPickerControlsFixture } from './color-picker-controls-fixture';
import { ColorPickerFormatsFixture } from './color-picker-formats-fixture';
import { ColorPickerGradientFixture } from './color-picker-gradient-fixture';
import { ColorPickerPanelFixture } from './color-picker-panel-fixture';
import { ColorPickerPanelViewFixture } from './color-picker-panel-view-fixture';
import { ColorPickerRootFixture } from './color-picker-root-fixture';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {new URLSearchParams(location.search).has('formats') ? (
      <ColorPickerFormatsFixture />
    ) : new URLSearchParams(location.search).has('root') ? (
      <ColorPickerRootFixture />
    ) : new URLSearchParams(location.search).has('view') ? (
      <ColorPickerPanelViewFixture />
    ) : new URLSearchParams(location.search).has('gradient') ? (
      <ColorPickerGradientFixture />
    ) : new URLSearchParams(location.search).has('panel') ? (
      <ColorPickerPanelFixture />
    ) : (
      <ColorPickerControlsFixture />
    )}
  </StrictMode>,
);
