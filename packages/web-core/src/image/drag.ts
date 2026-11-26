import { createPointerDrag } from '../_utils/pointer-drag.js';
import getFixTranslate from './utils/get-fix-translate.js';

export function createImageDrag(adapter: {
  readonly wrapper: HTMLElement | undefined;
  readonly image: HTMLElement | undefined;
  readonly scale: number;
  readonly translate: number[];
  setTranslate(value: number[]): void;
  setMoving(value: boolean): void;
}) {
  let startPageX = 0,
    startPageY = 0;
  let startTranslate = [0, 0];
  function fix() {
    if (!adapter.wrapper || !adapter.image) return;
    const wrapper = adapter.wrapper.getBoundingClientRect();
    const image = adapter.image.getBoundingClientRect();
    const [x, y] = getFixTranslate(
      wrapper,
      image,
      adapter.translate[0],
      adapter.translate[1],
      adapter.scale,
    );
    if (x !== adapter.translate[0] || y !== adapter.translate[1]) adapter.setTranslate([x, y]);
  }
  function move(event: PointerEvent) {
    const x = startTranslate[0] + (event.pageX - startPageX) / adapter.scale;
    const y = startTranslate[1] + (event.pageY - startPageY) / adapter.scale;
    adapter.setTranslate([x, y]);
  }
  const drag = createPointerDrag(move, () => {
    adapter.setMoving(false);
    fix();
  });
  function start(event: PointerEvent) {
    if (event.target !== event.currentTarget || !drag.start(event)) return;
    event.preventDefault();
    adapter.setMoving(true);
    startPageX = event.pageX;
    startPageY = event.pageY;
    startTranslate = [...adapter.translate];
  }
  return {
    fix,
    resetTranslate() {
      adapter.setTranslate([0, 0]);
    },
    connect(image: HTMLElement | undefined) {
      image?.addEventListener('pointerdown', start);
      return () => {
        image?.removeEventListener('pointerdown', start);
        drag.stop();
        adapter.setMoving(false);
      };
    },
  };
}
