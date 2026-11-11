/** @jsxImportSource react */
import { ColorPicker, Space } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const [gradient, setGradient] = useState(
    'linear-gradient(90deg, rgba(79, 172, 254, 1) 0%, rgba(0, 242, 254, 1) 100%)',
  );
  const [gradientOnly, setGradientOnly] = useState(
    'linear-gradient(135deg, rgba(255, 126, 95, 1) 0%, rgba(254, 180, 123, 1) 100%)',
  );
  const [recentColors, setRecentColors] = useState([
    'linear-gradient(90deg, rgba(79, 172, 254, 1) 0%, rgba(0, 242, 254, 1) 100%)',
  ]);
  const gradientSwatches = [
    'linear-gradient(90deg, rgba(79, 172, 254, 1) 0%, rgba(0, 242, 254, 1) 100%)',
    'linear-gradient(135deg, rgba(255, 126, 95, 1) 0%, rgba(254, 180, 123, 1) 100%)',
    'linear-gradient(120deg, rgba(67, 233, 123, 1) 0%, rgba(56, 249, 215, 1) 100%)',
  ];
  const updateRecentColors = (value: string[]) => {
    setRecentColors(value);
  };

  return (
    <>
      <Space direction={'vertical'} size={16}>
        <ColorPicker
          value={gradient}
          onValueChange={(next) => setGradient(next as typeof gradient)}
          colorModes={['monochrome', 'linear-gradient']}
          recentColors={recentColors}
          enableAlpha={true}
          onRecentColorsChange={updateRecentColors}
        />
        <ColorPicker
          value={gradientOnly}
          onValueChange={(next) => setGradientOnly(next as typeof gradientOnly)}
          colorModes={['linear-gradient']}
          swatchColors={gradientSwatches}
          hideTrigger={true}
        />
      </Space>
    </>
  );
}
