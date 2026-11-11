/** @jsxImportSource react */
import { ColorPicker } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [recentColors, setRecentColors] = useState(['#165DFF', 'rgba(54, 207, 201, 1)']);
  const swatchColors = ['#165DFF', '#0FC6C2', '#00B42A', '#FF7D00', '#F53F3F'];
  const updateRecentColors = (value: string[]) => {
    setRecentColors(value);
  };

  return (
    <>
      <ColorPicker
        defaultValue={'#165DFF'}
        recentColors={recentColors}
        swatchColors={swatchColors}
        onRecentColorsChange={updateRecentColors}
      />
    </>
  );
}
