import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { WatermarkOptions } from '../src/watermark/foundation.ts';

import { createWatermark } from '../dist/watermark/foundation.js';
import { createWatermarkObserver } from '../dist/watermark/observer.js';
import { getWatermarkTheme, handleWatermarkThemeMutations } from '../dist/watermark/theme.js';
import { canvasToGray, styleToString } from '../dist/watermark/utils.js';

function fixture(t: { after(callback: () => void): void }) {
  const originalDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
  const originalImage = Object.getOwnPropertyDescriptor(globalThis, 'Image');
  t.after(() => {
    if (originalDocument) Object.defineProperty(globalThis, 'document', originalDocument);
    else Reflect.deleteProperty(globalThis, 'document');
    if (originalImage) Object.defineProperty(globalThis, 'Image', originalImage);
    else Reflect.deleteProperty(globalThis, 'Image');
  });
  const operations: unknown[][] = [];
  const canvases: Array<{ width: number; height: number }> = [];
  const images: Array<{
    onload(): void;
    src: string;
    crossOrigin: string;
    referrerPolicy: string;
  }> = [];
  const children: Array<{ style: string }> = [];
  const ctx = {
    font: '',
    fillStyle: '',
    globalAlpha: 1,
    measureText(text: string) {
      operations.push(['measure', this.font, text]);
      return { width: String(text).length * 10 };
    },
    save() {
      operations.push(['save']);
    },
    restore() {
      operations.push(['restore']);
    },
    translate(...args: number[]) {
      operations.push(['translate', ...args]);
    },
    rotate(value: number) {
      operations.push(['rotate', value]);
    },
    fillText(...args: unknown[]) {
      operations.push(['text', this.font, ...args]);
    },
    drawImage(...args: unknown[]) {
      operations.push(['image', this.globalAlpha, ...args]);
    },
    getImageData() {
      operations.push(['gray']);
      return { data: new Uint8ClampedArray([255, 0, 0, 127]) };
    },
    putImageData() {},
  };
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: {
      createElement(type: string) {
        if (type === 'canvas') {
          const canvas = {
            width: 0,
            height: 0,
            getContext: () => ctx,
            toDataURL() {
              return `data:${this.width}x${this.height}`;
            },
          };
          canvases.push(canvas);
          return canvas;
        }
        return {
          style: '',
          setAttribute(name: string, value: string) {
            assert.equal(name, 'style');
            this.style = value;
          },
        };
      },
    },
  });
  Object.defineProperty(globalThis, 'Image', {
    configurable: true,
    value: class {
      onload = () => {};
      src = '';
      crossOrigin = '';
      referrerPolicy = '';
      constructor() {
        images.push(this);
      }
    },
  });
  const container = {
    contains: (child: (typeof children)[number]) => children.includes(child),
    removeChild(child: (typeof children)[number]) {
      children.splice(children.indexOf(child), 1);
    },
    append(child: (typeof children)[number]) {
      children.push(child);
    },
  };
  const props: WatermarkOptions = {
    content: ['AB', 'C'],
    gap: [10, 20],
    rotate: 0,
    zIndex: 6,
    alpha: 0.5,
    antiTamper: true,
    grayscale: false,
    repeat: true,
    staggered: true,
  };
  const adapter = {
    props,
    container: container as unknown as HTMLDivElement,
    theme: 'light' as 'light' | 'dark',
    ratio: 2,
  };
  return {
    props,
    adapter,
    ctx,
    operations,
    canvases,
    images,
    children,
    controller: createWatermark(adapter),
  };
}

test('watermark text measurement and drawing share the full font and preserve DPR/staggered geometry', (t) => {
  const f = fixture(t);
  f.props.font = { fontSize: 20, fontWeight: 'bold', fontStyle: 'italic' };
  f.controller.render();
  assert.equal(f.canvases[0].width, 120);
  assert.equal(f.canvases[0].height, 252);
  assert.deepEqual(f.operations[0], ['measure', 'italic normal bold 20px sans-serif', 'AB']);
  assert.ok(
    f.operations.some(
      (op) => op[0] === 'text' && op[1] === 'italic normal bold 40px/43px sans-serif',
    ),
  );
  assert.match(f.children[0].style, /background-size:60px/);
  assert.equal(f.operations.filter((op) => op[0] === 'image')[0][1], 1);
});

test('watermark placement retains negative offsets, repeat policy and replaces its own node', (t) => {
  const f = fixture(t);
  f.props.offset = [15, 0];
  f.props.repeat = false;
  f.controller.render();
  assert.match(f.children[0].style, /left:10px;top:0;width:calc\(100% - 10px\)/);
  assert.match(f.children[0].style, /background-repeat:no-repeat;background-position:0px -10px/);
  assert.equal(f.canvases[0].width, 60);
  const first = f.children[0];
  f.controller.render();
  assert.equal(f.children.length, 1);
  assert.notEqual(f.children[0], first);
});

test('watermark image version rejects stale loads and disposal rejects the final callback', (t) => {
  const f = fixture(t);
  f.props.image = 'first';
  f.controller.render();
  f.props.image = 'second';
  f.controller.render();
  assert.equal(f.images[0].crossOrigin, 'anonymous');
  assert.equal(f.images[0].referrerPolicy, 'no-referrer');
  f.images[0].onload();
  assert.equal(f.children.length, 0);
  f.images[1].onload();
  assert.equal(f.children.length, 1);
  f.props.image = 'third';
  f.controller.render();
  f.controller.dispose();
  const previous = f.children[0];
  f.images[2].onload();
  assert.equal(f.children[0], previous);
});

test('watermark async completion retains live style/grayscale options and captured image size', (t) => {
  const f = fixture(t);
  f.props.image = 'pending';
  f.props.width = 20;
  f.controller.render();
  f.props.width = 99;
  f.props.grayscale = true;
  f.props.zIndex = 12;
  f.props.staggered = false;
  f.images[0].onload();
  assert.match(f.children[0].style, /z-index:12/);
  const draw = f.operations.find((op) => op[0] === 'image')!;
  assert.equal(draw.at(-2), 40);
  assert.ok(f.operations.some((op) => op[0] === 'gray'));
});

test('watermark anti-tamper only restores owned removed or modified elements', (t) => {
  const f = fixture(t);
  f.controller.render();
  const mutation = (target: unknown, removedNodes: unknown[] = []) =>
    ({ type: 'attributes', target, removedNodes }) as unknown as MutationRecord;
  f.controller.mutations([mutation({})]);
  assert.equal(f.canvases.length, 1);
  f.controller.mutations([mutation(f.children[0])]);
  assert.equal(f.canvases.length, 2);
  f.controller.mutations([mutation({}, [f.children[0]])]);
  assert.equal(f.canvases.length, 3);
  f.props.antiTamper = false;
  f.controller.mutations([mutation(f.children[0])]);
  assert.equal(f.canvases.length, 3);
});

test('watermark dark and explicit text colors follow the latest theme', (t) => {
  const f = fixture(t);
  f.adapter.theme = 'dark';
  f.controller.render();
  assert.equal(f.ctx.fillStyle, 'rgba(255, 255, 255, 0.15)');
  f.props.font = { color: '#123456' };
  f.controller.render();
  assert.equal(f.ctx.fillStyle, '#123456');
});

test('watermark grayscale keeps alpha and style serialization preserves custom properties and undefined', () => {
  const data = new Uint8ClampedArray([255, 0, 0, 127, 0, 120, 0, 255]);
  let written = false;
  canvasToGray({
    width: 2,
    height: 1,
    getContext: () => ({
      getImageData: () => ({ data }),
      putImageData: () => {
        written = true;
      },
    }),
  } as unknown as HTMLCanvasElement);
  assert.deepEqual([...data], [85, 85, 85, 127, 40, 40, 40, 255]);
  assert.equal(written, true);
  assert.equal(
    styleToString({ 'backgroundColor': 'red', '--custom': 'ok', 'left': undefined }),
    'background-color:red;--custom:ok;left:undefined',
  );
});

test('watermark native observer disconnects before replacement and returns original support semantics', () => {
  const events: unknown[][] = [];
  class Observer {
    constructor(callback: MutationCallback) {
      events.push(['construct', callback]);
    }
    observe(...args: unknown[]) {
      events.push(['observe', ...args]);
    }
    disconnect() {
      events.push(['disconnect']);
    }
  }
  const callback = () => {};
  const target = {} as Node;
  const controller = createWatermarkObserver(callback, {
    window: { MutationObserver: Observer } as unknown as Window,
    childList: true,
  });
  controller.observe(target);
  controller.observe(null);
  controller.observe(target);
  controller.stop();
  controller.stop();
  assert.equal(controller.isSupported, true);
  assert.deepEqual(
    events.map((op) => op[0]),
    ['construct', 'observe', 'disconnect', 'construct', 'observe', 'disconnect'],
  );
  assert.deepEqual(events[1], ['observe', target, { childList: true }]);
  assert.equal(createWatermarkObserver(callback).isSupported, undefined);
});

test('watermark theme mutation reports once and keeps the original light fallback', () => {
  const element = { getAttribute: () => 'dark' } as unknown as HTMLElement;
  assert.equal(getWatermarkTheme(element), 'dark');
  assert.equal(getWatermarkTheme({ getAttribute: () => null } as unknown as HTMLElement), 'light');
  const events: string[] = [];
  const mutation = {
    type: 'attributes',
    attributeName: 'sd-theme',
    target: element,
  } as unknown as MutationRecord;
  handleWatermarkThemeMutations(
    [mutation, mutation],
    (theme) => events.push(theme),
    () => events.push('render'),
  );
  assert.deepEqual(events, ['dark', 'render']);
});
