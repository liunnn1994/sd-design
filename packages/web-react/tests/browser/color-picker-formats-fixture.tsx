import { ColorPicker, type ColorFormat } from '@sdata/web-react/color-picker';
import { useState } from 'react';

export function ColorPickerFormatsFixture() {
  const params = new URLSearchParams(location.search);
  const [value, setValue] = useState(
    params.has('gradient') ? 'linear-gradient(90deg, #ff0000 0%, #0000ff 100%)' : '#ff0000',
  );
  const [requested, setRequested] = useState('');
  const [changes, setChanges] = useState(0);
  return (
    <>
      <button onClick={() => setValue('#0000ff')}>External blue</button>
      <button onClick={() => setValue(requested)}>Accept requested</button>
      <ColorPicker
        hideTrigger={!params.has('trigger')}
        value={value}
        format={(params.get('format') ?? 'HEX') as ColorFormat}
        enableAlpha={params.has('alpha')}
        enableMultipleGradient={params.has('two-stops') ? false : undefined}
        colorModes={params.has('gradient') ? ['linear-gradient'] : ['monochrome']}
        swatchColors={['#0000ff']}
        onValueChange={(next) => {
          setRequested(next);
          if (!params.has('reject')) setValue(next);
        }}
        onChange={() => setChanges((count) => count + 1)}
      />
      <output data-testid="value">{value}</output>
      <output data-testid="requested">{requested}</output>
      <output data-testid="changes">{changes}</output>
    </>
  );
}
