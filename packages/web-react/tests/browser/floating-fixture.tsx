import { useState } from 'react';
import { createPortal } from 'react-dom';

import { useFloatingPosition } from '../../src/trigger/use-floating-position';

export function FloatingFixture() {
  const [reference, setReference] = useState<HTMLButtonElement | null>(null);
  const [popup, setPopup] = useState<HTMLDivElement | null>(null);
  const [wide, setWide] = useState(false);
  const [visible, setVisible] = useState(false);
  const position = useFloatingPosition(reference, popup, null, visible, {
    position: 'bottom',
    popupOffset: 10,
    autoFitPosition: true,
    autoFitPopupSize: true,
    showArrow: false,
    autoFixPosition: true,
    updateAtScroll: true,
  });
  return (
    <section>
      <button
        data-testid="floating-reference"
        ref={setReference}
        style={{ width: wide ? 240 : 120 }}
        onClick={() => setVisible(!visible)}
      >
        定位适配测试
      </button>
      <button onClick={() => setWide(!wide)}>改变锚点宽度</button>
      {visible &&
        createPortal(
          <div
            ref={setPopup}
            data-testid="floating-popup"
            data-placement={position?.placement}
            style={{
              position: position?.strategy ?? 'absolute',
              left: position?.x ?? 0,
              top: position?.y ?? 0,
              visibility: position ? 'visible' : 'hidden',
              width: 100,
              height: 40,
              background: 'white',
            }}
          >
            浮层内容
          </div>,
          document.body,
        )}
    </section>
  );
}
