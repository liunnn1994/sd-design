/** @jsxImportSource react */
import { Badge } from '@sdata/web-react';
import { useState } from 'react';

export default function Example() {
  const COLORS = [
    'red',
    'orangered',
    'orange',
    'gold',
    'lime',
    'green',
    'cyan',
    'sdblue',
    'purple',
    'pinkpurple',
    'magenta',
    'gray',
  ];
  const COLORS_CUSTOM = [
    '#F53F3F',
    '#7816FF',
    '#00B42A',
    '#165DFF',
    '#FF7D00',
    '#EB0AA4',
    '#7BC616',
    '#86909C',
    '#B71DE8',
    '#0FC6C2',
    '#FFB400',
    '#168CFF',
    '#FF5722',
  ];
  const [colors, setColors] = useState(COLORS);
  const [customColors, setCustomColors] = useState(COLORS_CUSTOM);

  return (
    <>
      <div>
        {colors.map((color) => (
          <Badge key={color} color={color} text={color} className={'sd:mr-6'} />
        ))}
      </div>
      <br />
      <div>
        {customColors.map((color) => (
          <Badge key={color} color={color} text={color} className={'sd:mr-6'} />
        ))}
      </div>
    </>
  );
}
