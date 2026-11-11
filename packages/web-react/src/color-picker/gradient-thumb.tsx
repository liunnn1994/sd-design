import type { GradientColorPoint } from '@sdata/web-core/color-picker/types';

import { createGradientThumb } from '@sdata/web-core/color-picker/control';
import { formatColor } from '@sdata/web-core/color-picker/utils';
import { useLayoutEffect, useRef, useState } from 'react';

interface GradientThumbProps {
  point: GradientColorPoint;
  prefixCls: string;
  active?: boolean;
  disabled?: boolean;
  onSelect(): void;
  onMove(clientX: number): void;
  onRemove(): void;
}

export function ColorGradientThumb(props: GradientThumbProps) {
  const element = useRef<HTMLButtonElement>(null);
  const live = useRef(props);
  live.current = props;
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [thumb] = useState(() =>
    createGradientThumb({
      get props() {
        return live.current;
      },
      schedule(callback) {
        clearTimeout(timer.current);
        timer.current = setTimeout(callback, 0);
      },
    }),
  );
  useLayoutEffect(() => {
    const node = element.current!;
    const win = node.ownerDocument.defaultView!;
    let pointerId: number | undefined;
    const detach = () => {
      pointerId = undefined;
      win.removeEventListener('pointermove', move);
      win.removeEventListener('pointerup', end);
      win.removeEventListener('pointercancel', end);
    };
    const move = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) return;
      event.preventDefault();
      event.stopPropagation();
      thumb.move(event.clientX);
    };
    const end = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) return;
      detach();
      thumb.end();
    };
    const down = (event: PointerEvent) => {
      if (live.current.disabled || (event.button !== 0 && event.button !== -1)) return;
      event.preventDefault();
      event.stopPropagation();
      detach();
      pointerId = event.pointerId;
      thumb.start();
      win.addEventListener('pointermove', move);
      win.addEventListener('pointerup', end);
      win.addEventListener('pointercancel', end);
    };
    node.addEventListener('pointerdown', down);
    return () => {
      detach();
      node.removeEventListener('pointerdown', down);
      clearTimeout(timer.current);
    };
  }, [thumb, props.disabled]);
  return (
    <button
      ref={element}
      type="button"
      disabled={props.disabled}
      className={[
        `${props.prefixCls}-gradient-thumb`,
        props.active && `${props.prefixCls}-gradient-thumb-active`,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ left: `${props.point.left}%` }}
      onClick={(event) => thumb.click(event.nativeEvent)}
      onKeyDown={(event) => thumb.keydown(event.nativeEvent)}
    >
      <span
        className={`${props.prefixCls}-gradient-thumb-inner`}
        style={{ backgroundColor: formatColor(props.point.hsva, 'CSS', true) }}
      />
    </button>
  );
}
