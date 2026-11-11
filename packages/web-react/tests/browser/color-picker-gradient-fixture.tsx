import { useState } from 'react';

import { ColorGradientThumb } from '../../src/color-picker/gradient-thumb.js';
import { useColorPanel } from '../../src/color-picker/use-panel.js';

export function ColorPickerGradientFixture() {
  const [value, setValue] = useState(
    'linear-gradient(90deg, #ff0000 0%, #00ff00 50%, #0000ff 100%)',
  );
  const [disabled, setDisabled] = useState(false);
  const [mounted, setMounted] = useState(true);
  const [changes, setChanges] = useState(0);
  const { state, foundation, track, shell } = useColorPanel({
    value,
    colorModes: ['linear-gradient'],
    disabled,
    enableAlpha: false,
    format: 'RGB',
    recentColors: [],
    swatchColors: [],
    enableMultipleGradient: true,
    onChange(next) {
      setValue(next);
      setChanges((count) => count + 1);
    },
  });
  return (
    <div className="sd-color-picker-panel">
      <button onClick={() => setDisabled(!disabled)}>Disabled</button>
      <button onClick={() => setMounted(!mounted)}>Mount thumbs</button>
      <div
        ref={shell}
        className="sd-color-picker-gradient-bar-shell"
        style={{ width: 300, margin: 30 }}
      >
        <button ref={track} className="sd-color-picker-gradient-bar" style={{ width: 300 }} />
        {mounted &&
          state.gradientColors.map((point) => (
            <ColorGradientThumb
              key={point.id}
              point={point}
              prefixCls="sd-color-picker"
              active={point.id === state.gradientSelectedId}
              disabled={disabled}
              onSelect={() => foundation.handleThumbSelect(point.id)}
              onMove={(x) => foundation.updateThumbLeft(point.id, x)}
              onRemove={() => foundation.handleThumbRemove(point.id)}
            />
          ))}
      </div>
      <output data-testid="value">{value}</output>
      <output data-testid="changes">{changes}</output>
    </div>
  );
}
