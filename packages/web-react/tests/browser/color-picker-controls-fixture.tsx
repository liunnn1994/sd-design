import { hsvToRgb } from '@sdata/web-core/_utils/color';
import { useLayoutEffect, useRef, useState } from 'react';

import { ColorControlBar, ColorPalette } from '../../src/color-picker/controls.js';

export function ColorPickerControlsFixture() {
  const [hsv, setHsv] = useState({ h: 0, s: 0.5, v: 0.5 });
  const [alpha, setAlpha] = useState(1);
  const [changes, setChanges] = useState(0);
  const [mounted, setMounted] = useState(true);
  const controls = useRef<HTMLDivElement>(null);
  const pressed = useRef(false);
  const layoutPass = useRef(0);
  useLayoutEffect(() => {
    controls.current!.dataset.controlLayoutPass = String(++layoutPass.current);
    controls.current!.dataset.controlStrict = String(import.meta.env.DEV);
    if (pressed.current || !new URLSearchParams(location.search).has('early')) return;
    pressed.current = true;
    const bar = controls.current!.querySelector<HTMLElement>('.sd-color-picker-control-bar-hue')!;
    const rect = bar.getBoundingClientRect();
    bar.dispatchEvent(
      new MouseEvent('mousedown', {
        bubbles: true,
        buttons: 1,
        clientX: rect.left + rect.width * 0.75,
        clientY: rect.top + rect.height * 0.5,
      }),
    );
    window.dispatchEvent(new MouseEvent('mouseup'));
  }, []);
  const color = { hsv, rgb: hsvToRgb(hsv.h, hsv.s, hsv.v), hex: '#804040' };
  return (
    <>
      <button onClick={() => setMounted(!mounted)}>Mount controls</button>
      {mounted && (
        <div ref={controls} className="sd-color-picker-panel" style={{ width: 300 }}>
          <ColorPalette
            color={color}
            onChange={(s, v) => {
              setHsv({ ...hsv, s, v });
              setChanges((count) => count + 1);
            }}
          />
          <ColorControlBar
            color={color}
            x={hsv.h}
            onChange={(h) => {
              setHsv({ ...hsv, h });
              setChanges((count) => count + 1);
            }}
          />
          <ColorControlBar
            type="alpha"
            color={color}
            x={alpha}
            onChange={(value) => {
              setAlpha(value);
              setChanges((count) => count + 1);
            }}
          />
        </div>
      )}
      <output data-testid="hsv">
        {hsv.h.toFixed(2)}|{hsv.s.toFixed(2)}|{hsv.v.toFixed(2)}
      </output>
      <output data-testid="alpha">{alpha.toFixed(2)}</output>
      <output data-testid="changes">{changes}</output>
    </>
  );
}
