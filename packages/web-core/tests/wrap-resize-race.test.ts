import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createWrapClampFoundation } from '../dist/clamp/wrap/foundation.js';

test('wrap remeasures a width change committed while rejecting the last candidate', async () => {
  let width = 220;
  class Box {
    dataset = { part: 'item' };
    firstElementChild: Box | null = null;
    nextElementSibling: Box | null = null;
    index: number;
    constructor(index = 0) {
      this.index = index;
    }
    getBoundingClientRect() {
      const top = Math.floor(this.index / Math.floor(width / 60)) * 24;
      return { width: 60, height: 24, top, bottom: top + 24 };
    }
  }
  const original = Object.getOwnPropertyDescriptor(globalThis, 'HTMLElement');
  Object.defineProperty(globalThis, 'HTMLElement', { configurable: true, value: Box });
  try {
    const cell = <T>(value: T) => ({ value });
    const root = new Box();
    root.getBoundingClientRect = () => ({ width, height: 48, top: 0, bottom: 48 });
    const content = new Box();
    const state = {
      rootRef: cell(root as unknown as HTMLElement),
      contentRef: cell(content as unknown as HTMLElement),
      beforeRef: cell<HTMLElement | null>(null),
      afterRef: cell<HTMLElement | null>(null),
      expanded: cell(false),
      visibleCount: cell(5),
      materializedCount: cell(0),
      isClamped: cell(true),
    };
    let rejectedCandidate = false;
    const render = () => {
      const boxes = Array.from({ length: state.visibleCount.value + 1 }, (_, i) => new Box(i));
      boxes.at(-1)!.dataset.part = 'after';
      boxes.forEach((box, i) => {
        box.nextElementSibling = boxes[i + 1] ?? null;
      });
      content.firstElementChild = boxes[0];
      state.afterRef.value = boxes.at(-1)! as unknown as HTMLElement;
    };
    render();
    const foundation = createWrapClampFoundation({
      items: Array.from({ length: 12 }),
      maxLines: 2,
      maxHeight: undefined,
      slots: { after: true },
      state,
      afterRender: async () => {
        if (state.visibleCount.value === 6) rejectedCandidate = true;
        else if (rejectedCandidate && state.visibleCount.value === 5) width = 460;
        render();
      },
    });
    foundation.requestRecompute();
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(width, 460, 'resize lands at the final rejected-candidate commit');
    assert.equal(state.visibleCount.value, 12);
    assert.equal(state.isClamped.value, false);
  } finally {
    if (original) Object.defineProperty(globalThis, 'HTMLElement', original);
    else Reflect.deleteProperty(globalThis, 'HTMLElement');
  }
});
