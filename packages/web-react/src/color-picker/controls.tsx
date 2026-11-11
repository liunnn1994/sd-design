import type { Color } from '@sdata/web-core/color-picker/types';

import { hsvToRgb } from '@sdata/web-core/_utils/color';

import { usePrefix } from '../config-provider/index.js';
import { useColorControl } from './use-control.js';

export function ColorPalette({
  color,
  onChange,
}: {
  color: Color;
  onChange(s: number, v: number): void;
}) {
  const prefix = usePrefix('color-picker');
  const { hsv } = color;
  const { block, down } = useColorControl(
    () => [hsv.s, 1 - hsv.v],
    ([s, y]) => onChange(s, 1 - y),
  );
  const rgb = hsvToRgb(hsv.h, 1, 1);
  return (
    <div
      ref={block}
      className={`${prefix}-palette`}
      style={{ backgroundColor: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` }}
      onMouseDown={(event) => down(event.nativeEvent)}
    >
      <div
        className={`${prefix}-handler`}
        style={{ top: `${(1 - hsv.v) * 100}%`, left: `${hsv.s * 100}%` }}
      />
    </div>
  );
}

export function ColorControlBar({
  x,
  color,
  colorString,
  type = 'hue',
  onChange,
}: {
  x: number;
  color: Color;
  colorString?: string;
  type?: 'hue' | 'alpha';
  onChange(value: number): void;
}) {
  const prefix = usePrefix('color-picker');
  const { block, down } = useColorControl(
    () => [x, 0],
    ([next]) => onChange(next),
  );
  const bar = (
    <div
      ref={block}
      className={`${prefix}-control-bar ${prefix}-control-bar-${type}`}
      style={
        type === 'alpha'
          ? {
              background: `linear-gradient(to right, rgba(0, 0, 0, 0), rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}))`,
            }
          : undefined
      }
      onMouseDown={(event) => down(event.nativeEvent)}
    >
      <div className={`${prefix}-handler`} style={{ left: `${x * 100}%`, color: colorString }} />
    </div>
  );
  return type === 'alpha' ? <div className={`${prefix}-control-bar-bg`}>{bar}</div> : bar;
}
