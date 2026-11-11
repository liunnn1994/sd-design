import { useState } from 'react';

import { useColorPanel } from '../../src/color-picker/use-panel.js';

export function ColorPickerPanelFixture() {
  const [value, setValue] = useState('#ff0000');
  const [accept, setAccept] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [events, setEvents] = useState<string[]>([]);
  const [alpha, setAlpha] = useState(false);
  const { state, format, drafts, foundation } = useColorPanel({
    value,
    colorModes: ['monochrome', 'linear-gradient'],
    disabled,
    enableAlpha: alpha,
    format: 'HEX',
    recentColors: [],
    swatchColors: [],
    enableMultipleGradient: true,
    onChange(next, trigger) {
      setEvents((previous) => [...previous, trigger]);
      if (accept) setValue(next);
    },
  });
  return (
    <>
      <button onClick={() => setAccept(!accept)}>Accept changes</button>
      <button onClick={() => setDisabled(!disabled)}>Disabled</button>
      <button onClick={() => setAlpha(!alpha)}>Alpha</button>
      <button onClick={() => foundation.handleHueChange(0.5)}>Hue</button>
      <button onClick={() => foundation.handleModeChange('linear-gradient')}>Gradient</button>
      <button onClick={() => foundation.handleFormatChange('HSL')}>HSL</button>
      <button onClick={() => setValue('linear-gradient(90deg, #ff0000 0%, #0000ff 100%)')}>
        External gradient
      </button>
      <button onClick={() => foundation.handleThumbSelect(state.gradientColors[1].id)}>
        Second point
      </button>
      <button onClick={() => setValue('linear-gradient(180deg, #ff0000 10%, #0000ff 90%)')}>
        Move external points
      </button>
      <output data-testid="value">{value}</output>
      <output data-testid="hue">{foundation.active().h.toFixed(2)}</output>
      <output data-testid="format">{format}</output>
      <output data-testid="drafts">{drafts.join('|')}</output>
      <output data-testid="events">{events.join('|')}</output>
      <output data-testid="mode">{state.mode}</output>
      <output data-testid="selected-point">{state.gradientSelectedId}</output>
    </>
  );
}
