import type Cropper from 'cropperjs';
import type { CropperCanvas, CropperImage, CropperSelection } from 'cropperjs';

import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { CropperProps } from '../src/cropper/types.ts';

import {
  createCropper,
  getCropperRootStyle,
  resolveCropperSize,
} from '../dist/cropper/foundation.js';

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

class ElementStub extends EventTarget {
  attributes = new Map<string, string>();
  listeners = new Map<string, Set<EventListener>>();
  getAttribute(name: string) {
    return this.attributes.get(name) ?? null;
  }
  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
  }
  removeAttribute(name: string) {
    this.attributes.delete(name);
  }
  override addEventListener(name: string, fn: EventListener) {
    super.addEventListener(name, fn);
    if (!this.listeners.has(name)) this.listeners.set(name, new Set());
    this.listeners.get(name)!.add(fn);
  }
  override removeEventListener(name: string, fn: EventListener) {
    super.removeEventListener(name, fn);
    this.listeners.get(name)?.delete(fn);
  }
  emit(name: string, detail?: unknown) {
    this.dispatchEvent(new CustomEvent(name, { detail }));
  }
  count() {
    return [...this.listeners.values()].reduce((sum, set) => sum + set.size, 0);
  }
}

function fixture() {
  const queued: Array<() => void> = [];
  const events: unknown[][] = [];
  const source = Object.assign(new ElementStub(), {
    complete: true,
    naturalWidth: 640,
    naturalHeight: 360,
    src: 'first',
  });
  const loaded = new ElementStub();
  const ready = deferred<HTMLImageElement>();
  const canvas = new ElementStub();
  const image = Object.assign(new ElementStub(), {
    clientWidth: 320,
    clientHeight: 180,
    src: '',
    matrix: [1, 0, 0, 1, 0, 0],
    $getTransform() {
      return this.matrix;
    },
    $ready: () => ready.promise,
  });
  const selection = Object.assign(new ElementStub(), {
    x: 10,
    y: 20,
    width: 100,
    height: 80,
    $render: () => events.push(['render']),
    $change(x: number, y: number, width: number, height: number) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.emit('change', { x, y, width, height });
    },
  });
  const selections = [selection];
  let constructions = 0,
    destructions = 0;
  class Constructor {
    constructor(element: HTMLImageElement, options: unknown) {
      constructions++;
      events.push(['construct', element, options]);
    }
    getCropperCanvas() {
      return canvas as unknown as CropperCanvas;
    }
    getCropperImage() {
      return image as unknown as CropperImage;
    }
    getCropperSelection() {
      return selection as unknown as CropperSelection;
    }
    getCropperSelections() {
      return selections;
    }
    destroy() {
      destructions++;
    }
  }
  const props: CropperProps & {
    canvasProps: NonNullable<CropperProps['canvasProps']>;
    imageProps: NonNullable<CropperProps['imageProps']>;
    selectionProps: NonNullable<CropperProps['selectionProps']>;
  } = {
    src: 'first',
    canvasProps: {},
    imageProps: {},
    selectionProps: {},
    fitSelectionToImage: false,
  };
  const adapter = {
    props,
    imageElement: source as unknown as HTMLImageElement | undefined,
    afterRender(callback: () => void) {
      queued.push(callback);
      return Promise.resolve();
    },
    loadConstructor: async () => Constructor as unknown as typeof Cropper,
    selectionChange: (detail: unknown) => {
      events.push(['change', detail]);
    },
    updateSelectionX: (value: number) => {
      events.push(['x', value]);
    },
    updateSelectionY: (value: number) => {
      events.push(['y', value]);
    },
    updateSelectionWidth: (value: number) => {
      events.push(['width', value]);
    },
    updateSelectionHeight: (value: number) => {
      events.push(['height', value]);
    },
    imageTransform: (detail: unknown) => {
      events.push(['transform', detail]);
    },
    canvasEvents: Object.fromEntries(
      ['action', 'actionstart', 'actionmove', 'actionend'].map((name) => [
        name,
        (detail: unknown) => {
          events.push([name, detail]);
        },
      ]),
    ) as Record<'action' | 'actionstart' | 'actionmove' | 'actionend', (detail: unknown) => void>,
  };
  const controller = createCropper(adapter);
  const flush = async () => {
    for (let pass = 0; pass < 8; pass++) {
      while (queued.length) queued.shift()!();
      await Promise.resolve();
    }
  };
  return {
    props,
    adapter,
    controller,
    source,
    loaded,
    ready,
    canvas,
    image,
    selection,
    selections,
    events,
    flush,
    get constructions() {
      return constructions;
    },
    get destructions() {
      return destructions;
    },
  };
}

test('cropper size normalization keeps numeric zero, strings and fallback CSS variables', () => {
  assert.equal(resolveCropperSize(0), '0px');
  assert.equal(resolveCropperSize('50vh'), '50vh');
  assert.equal(resolveCropperSize(null), '100%');
  assert.deepEqual(getCropperRootStyle(320, '240px'), {
    '--sd-cropper-width': '320px',
    '--sd-cropper-height': '240px',
  });
});

test('cropper pending constructor cannot mount after destroy or a missing source ref', async () => {
  const f = fixture();
  const constructor = deferred<typeof Cropper>();
  f.adapter.loadConstructor = () => constructor.promise;
  const mounting = f.controller.mount();
  f.controller.destroy();
  const real = fixture();
  constructor.resolve(await real.adapter.loadConstructor());
  await mounting;
  await f.flush();
  assert.equal(real.constructions, 0);
  assert.equal(f.controller.getInstance(), null);
  const missing = fixture();
  missing.adapter.imageElement = undefined;
  await missing.controller.mount();
  assert.equal(missing.constructions, 0);
});

test('cropper initializes its template and exposes native element identity after render', async () => {
  const f = fixture();
  f.props.template = '<cropper-canvas/>';
  await f.controller.mount();
  assert.equal(f.events[0][0], 'construct');
  assert.deepEqual(f.events[0][2], { template: '<cropper-canvas/>' });
  await f.flush();
  assert.equal(f.controller.getCropperCanvas(), f.canvas);
  assert.equal(f.controller.getCropperImage(), f.image);
  assert.equal(f.controller.getCropperSelection(), f.selection);
  assert.equal(f.controller.getCropperSelections(), f.selections);
});

test('cropper element props restore original attributes when keys disappear', async () => {
  const f = fixture();
  f.canvas.setAttribute('background', '');
  f.canvas.setAttribute('theme-color', 'original');
  f.props.canvasProps = { background: false, themeColor: 'red', scaleStep: 0.2 };
  await f.controller.mount();
  await f.flush();
  assert.equal(f.canvas.getAttribute('background'), null);
  assert.equal(f.canvas.getAttribute('theme-color'), 'red');
  assert.equal(f.canvas.getAttribute('scale-step'), '0.2');
  f.props.canvasProps = {};
  f.controller.syncCanvasProps();
  assert.equal(f.canvas.getAttribute('background'), '');
  assert.equal(f.canvas.getAttribute('theme-color'), 'original');
  assert.equal(f.canvas.getAttribute('scale-step'), null);
});

test('cropper selection events preserve raw detail identity and update order', async () => {
  const f = fixture();
  await f.controller.mount();
  await f.flush();
  f.events.length = 0;
  const detail = { x: 3, y: 4, width: 5, height: 6 };
  f.selection.emit('change', detail);
  assert.deepEqual(f.events, [
    ['change', detail],
    ['x', 3],
    ['y', 4],
    ['width', 5],
    ['height', 6],
  ]);
  assert.equal(f.events[0][1], detail);
});

test('cropper suppresses initial default geometry until ready and then reapplies controlled fields', async () => {
  const f = fixture();
  f.props.selectionX = 7;
  await f.controller.mount();
  await f.flush();
  f.events.length = 0;
  f.selection.emit('change', { x: 0, y: 0, width: 1, height: 1 });
  assert.equal(f.events.length, 0);
  f.ready.resolve(f.loaded as unknown as HTMLImageElement);
  await f.flush();
  assert.equal(f.selection.x, 7);
  f.events.length = 0;
  f.selection.emit('change', { x: 4, y: 5, width: 6, height: 7 });
  assert.equal(f.events[0][0], 'change');
});

test('cropper partial controlled geometry preserves remaining values and supports render fallback', async () => {
  const f = fixture();
  await f.controller.mount();
  await f.flush();
  f.props.selectionWidth = 42;
  f.controller.syncSelectionGeometry();
  assert.deepEqual(
    [f.selection.x, f.selection.y, f.selection.width, f.selection.height],
    [10, 20, 42, 80],
  );
  Reflect.deleteProperty(f.selection, '$change');
  f.props.selectionY = 9;
  f.controller.syncSelectionGeometry();
  assert.equal(f.selection.y, 9);
  assert.equal(f.events.at(-1)?.[0], 'render');
});

test('cropper forwards native canvas/image detail and destroys every tracked listener once', async () => {
  const f = fixture();
  await f.controller.mount();
  await f.flush();
  f.events.length = 0;
  const detail = { matrix: [1], oldMatrix: [0] };
  for (const name of ['action', 'actionstart', 'actionmove', 'actionend'])
    f.canvas.emit(name, detail);
  f.image.emit('transform', detail);
  assert.deepEqual(
    f.events.map((event) => event[0]),
    ['action', 'actionstart', 'actionmove', 'actionend', 'transform'],
  );
  assert.equal(f.events[4][1], detail);
  f.controller.destroy();
  f.controller.destroy();
  assert.equal(f.destructions, 1);
  assert.equal(f.canvas.count() + f.image.count() + f.selection.count(), 0);
  f.canvas.emit('action', detail);
  assert.equal(f.events.length, 5);
  assert.equal(f.controller.getCropperSelection(), null);
});

test('cropper ready fit uses scaled image client dimensions and explicit zero coordinates', async () => {
  const f = fixture();
  f.props.fitSelectionToImage = true;
  f.props.selectionX = 0;
  f.props.selectionY = 0;
  f.image.matrix = [2, 0, 0, 3, 0, 0];
  await f.controller.mount();
  await f.flush();
  f.ready.resolve(f.loaded as unknown as HTMLImageElement);
  await f.flush();
  assert.deepEqual(
    [f.selection.x, f.selection.y, f.selection.width, f.selection.height],
    [0, 0, 638, 538],
  );
  assert.equal(f.loaded.count(), 1);
  f.image.clientWidth = 400;
  f.loaded.emit('load');
  await f.flush();
  assert.equal(f.selection.width, 798);
  f.controller.destroy();
  assert.equal(f.loaded.count(), 0);
});

test('cropper source-load listener removes itself and ignores ready completion after destroy', async () => {
  const f = fixture();
  f.props.fitSelectionToImage = true;
  f.source.complete = false;
  await f.controller.mount();
  await f.flush();
  assert.equal(f.source.count(), 1);
  f.source.complete = true;
  f.source.emit('load');
  assert.equal(f.source.count(), 0);
  f.controller.destroy();
  f.ready.resolve(f.loaded as unknown as HTMLImageElement);
  await f.flush();
  assert.equal(f.loaded.count(), 0);
  assert.equal(f.selection.width, 100);
});

test('cropper source sync writes current native image, falls back before initialization and stays destroyed', async () => {
  const f = fixture();
  f.controller.syncSource('before');
  assert.equal(f.source.src, 'before');
  await f.controller.mount();
  await f.flush();
  f.controller.syncSource('after');
  assert.equal(f.image.src, 'after');
  f.controller.destroy();
  f.controller.syncSource(undefined);
  await f.flush();
  assert.equal(f.source.src, '');
  assert.equal(f.constructions, 1);
  assert.equal(f.controller.getInstance(), null);
});
