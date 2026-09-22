import { computed, shallowRef, type Ref } from 'vue';

import { onKeyStroke, useEventListener, useResizeObserver } from '@vueuse/core';

export function usePreviewCanvas(
  viewport: Ref<SVGSVGElement | null>,
  content: Ref<HTMLElement | null>,
  pageWidth: number,
) {
  const scale = shallowRef(1);
  const x = shallowRef(16);
  const y = shallowRef(16);
  const height = shallowRef(1000);
  const hand = shallowRef(false);
  const space = shallowRef(false);
  const dragging = shallowRef(false);
  const automatic = shallowRef(true);
  const matrix = computed(() => `matrix(${scale.value} 0 0 ${scale.value} ${x.value} ${y.value})`);
  let drag: { id: number; clientX: number; clientY: number; x: number; y: number } | undefined;

  function fit() {
    const bounds = viewport.value?.getBoundingClientRect();
    if (!bounds?.width) return;
    scale.value = Math.min(1, Math.max(0.1, (bounds.width - 32) / pageWidth));
    x.value = (bounds.width - pageWidth * scale.value) / 2;
    y.value = 16;
    automatic.value = true;
  }
  function zoom(value: number, anchor?: { x: number; y: number }) {
    const bounds = viewport.value?.getBoundingClientRect();
    if (!bounds) return;
    const point = anchor ?? { x: bounds.width / 2, y: bounds.height / 2 };
    const next = Math.min(2, Math.max(0.1, value));
    const ratio = next / scale.value;
    x.value = point.x - (point.x - x.value) * ratio;
    y.value = point.y - (point.y - y.value) * ratio;
    scale.value = next;
    automatic.value = false;
  }
  function endDrag() {
    dragging.value = false;
    drag = undefined;
  }
  useResizeObserver(content, ([entry]) => {
    height.value = Math.ceil(entry.contentRect.height);
  });
  useResizeObserver(viewport, () => {
    if (automatic.value) fit();
  });
  useEventListener(
    viewport,
    'pointerdown',
    (event: PointerEvent) => {
      if (drag || (event.button !== 0 && event.button !== 1)) return;
      if (!hand.value && !space.value && event.button !== 1 && event.target !== viewport.value)
        return;
      event.preventDefault();
      event.stopPropagation();
      viewport.value?.focus({ preventScroll: true });
      drag = {
        id: event.pointerId,
        clientX: event.clientX,
        clientY: event.clientY,
        x: x.value,
        y: y.value,
      };
      dragging.value = true;
      automatic.value = false;
    },
    { capture: true },
  );
  useEventListener('pointermove', (event) => {
    if (!drag || event.pointerId !== drag.id) return;
    x.value = drag.x + event.clientX - drag.clientX;
    y.value = drag.y + event.clientY - drag.clientY;
  });
  useEventListener(['pointerup', 'pointercancel'], endDrag);
  useEventListener('blur', () => {
    space.value = false;
    endDrag();
  });
  useEventListener(
    viewport,
    'wheel',
    (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey && !hand.value && event.target !== viewport.value)
        return;
      event.preventDefault();
      const bounds = viewport.value!.getBoundingClientRect();
      if (event.ctrlKey || event.metaKey) {
        zoom(scale.value * Math.exp(-event.deltaY * 0.002), {
          x: event.clientX - bounds.left,
          y: event.clientY - bounds.top,
        });
      } else {
        const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? bounds.height : 1;
        x.value -= event.deltaX * unit;
        y.value -= event.deltaY * unit;
        automatic.value = false;
      }
    },
    { passive: false },
  );
  onKeyStroke(
    [' ', '+', '=', '-', '0', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Escape'],
    (event) => {
      // Never steal typing, select navigation or button activation from the HTML page.
      if (event.target !== viewport.value) return;
      event.preventDefault();
      if (event.key === ' ') space.value = true;
      else if (event.key === '0') fit();
      else if (event.key === '+' || event.key === '=') zoom(scale.value * 1.2);
      else if (event.key === '-') zoom(scale.value / 1.2);
      else if (event.key === 'Escape') {
        space.value = false;
        hand.value = false;
        endDrag();
      } else {
        x.value += event.key === 'ArrowLeft' ? 40 : event.key === 'ArrowRight' ? -40 : 0;
        y.value += event.key === 'ArrowUp' ? 40 : event.key === 'ArrowDown' ? -40 : 0;
        automatic.value = false;
      }
    },
    { target: viewport },
  );
  onKeyStroke(
    ' ',
    () => {
      space.value = false;
    },
    { eventName: 'keyup' },
  );
  useEventListener(viewport, 'blur', () => {
    space.value = false;
  });
  // Captured clicks after a grab must not activate controls beneath the cursor.
  useEventListener(
    viewport,
    'click',
    (event) => {
      if (hand.value || space.value) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    { capture: true },
  );
  return { scale, matrix, height, hand, space, dragging, fit, zoom };
}
