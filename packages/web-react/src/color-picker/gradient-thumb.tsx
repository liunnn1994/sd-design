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
  const pointerId = useRef<number | undefined>(undefined);
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
    const detach = () => {
      win.removeEventListener('pointermove', move);
      win.removeEventListener('pointerup', end);
      win.removeEventListener('pointercancel', end);
    };
    const move = (event: PointerEvent) => {
      if (event.pointerId !== pointerId.current) return;
      event.preventDefault();
      event.stopPropagation();
      thumb.move(event.clientX);
    };
    const end = (event: PointerEvent) => {
      if (event.pointerId !== pointerId.current) return;
      pointerId.current = undefined;
      detach();
      thumb.end();
    };
    const attach = () => {
      win.addEventListener('pointermove', move);
      win.addEventListener('pointerup', end);
      win.addEventListener('pointercancel', end);
    };
    const down = (event: PointerEvent) => {
      if (live.current.disabled || (event.button !== 0 && event.button !== -1)) return;
      event.preventDefault();
      event.stopPropagation();
      detach();
      pointerId.current = event.pointerId;
      thumb.start();
      attach();
    };
    node.addEventListener('pointerdown', down);
    // StrictMode can replay this effect after the first press has started a drag.
    if (props.disabled) pointerId.current = undefined;
    else if (pointerId.current !== undefined) attach();
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
