import { useState } from 'react';

import { ColorPanel } from '../../src/color-picker/panel.js';

export function ColorPickerPanelViewFixture() {
  const [value, setValue] = useState('#ff0000');
  const [recent, setRecent] = useState<string[]>([]);
  const [disabled, setDisabled] = useState(false);
  const [alpha, setAlpha] = useState(false);
  return (
    <>
      <button onClick={() => setDisabled(!disabled)}>Disabled</button>
      <button onClick={() => setAlpha(!alpha)}>Alpha</button>
      <ColorPanel
        value={value}
        colorModes={['monochrome', 'linear-gradient']}
        disabled={disabled}
        enableAlpha={alpha}
        format="HEX"
        recentColors={recent}
        swatchColors={['#0000ff']}
        enableMultipleGradient
        onChange={setValue}
        onRecentColorsChange={setRecent}
      />
      <output data-testid="value">{value}</output>
      <output data-testid="recent">{recent.join('|')}</output>
    </>
  );
}
