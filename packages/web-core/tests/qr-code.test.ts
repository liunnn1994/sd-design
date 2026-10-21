import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  createQrCode,
  getQrCodeIconStyle,
  getQrCodeOptions,
  getQrCodeStyle,
  mergeQrCodeValue,
} from '../dist/qr-code/foundation.js';

const props = {
  color: '',
  bgColor: 'transparent',
  errorLevel: 'M' as const,
  marginSize: 0,
  size: 160,
  boostLevel: true,
};

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

function fixture() {
  const svgRequests: ReturnType<typeof deferred<string>>[] = [];
  const canvasRequests: ReturnType<typeof deferred<void>>[] = [];
  const draws: unknown[][] = [];
  const target = {
    width: 0,
    height: 0,
    getContext: () => ({ drawImage: (...args: unknown[]) => draws.push(args) }),
  } as unknown as HTMLCanvasElement;
  const scratch = { width: 180, height: 170 } as HTMLCanvasElement;
  const adapter = {
    value: 'first',
    type: 'svg' as 'canvas' | 'svg',
    options: getQrCodeOptions(props, 'light'),
    canvas: target as HTMLCanvasElement | undefined,
    nextRender: async () => {},
    createCanvas: () => scratch,
    setSvg: (markup: string) => {
      result.svg = markup;
    },
    engine: {
      async toString() {
        const request = deferred<string>();
        svgRequests.push(request);
        return request.promise;
      },
      async toCanvas() {
        const request = deferred<void>();
        canvasRequests.push(request);
        return request.promise;
      },
    },
  };
  const result = {
    svg: 'previous',
    adapter,
    target,
    scratch,
    draws,
    svgRequests,
    canvasRequests,
    foundation: createQrCode(adapter),
  };
  return result;
}

test('QrCode preserves multiline values, zero dimensions and transparent root style', () => {
  assert.equal(mergeQrCodeValue(['a', '', 'b']), 'a\n\nb');
  assert.equal(mergeQrCodeValue(undefined), '');
  assert.equal(mergeQrCodeValue([]), '');
  assert.deepEqual(getQrCodeIconStyle(0), { width: '0px', height: '0px' });
  assert.deepEqual(getQrCodeIconStyle({ width: 20, height: 40 }), {
    width: '20px',
    height: '40px',
  });
  assert.deepEqual(getQrCodeStyle(160, 'transparent'), {
    width: '160px',
    height: '160px',
    backgroundColor: undefined,
  });
  assert.equal(getQrCodeStyle(90, '#123456').backgroundColor, '#123456');
});

test('QrCode keeps theme defaults, explicit colors and engine options', () => {
  assert.deepEqual(getQrCodeOptions(props, 'dark').color, { dark: '#f6f6f6', light: '#20201e' });
  assert.deepEqual(getQrCodeOptions(props, 'light').color, { dark: '#0b0b0a', light: '#ffffff' });
  assert.deepEqual(
    getQrCodeOptions(
      {
        ...props,
        color: '#112233',
        bgColor: '#445566',
        boostLevel: false,
        marginSize: 8,
        size: 200,
        errorLevel: 'H',
      },
      'dark',
    ),
    {
      errorCorrectionLevel: 'H',
      width: 200,
      margin: 8,
      boostLevel: false,
      color: { dark: '#112233', light: '#445566' },
    },
  );
});

test('QrCode invalidates a pending render before the host commits its next view', async () => {
  const state = fixture();
  const tick = deferred<void>();
  state.adapter.nextRender = () => tick.promise;
  const first = state.foundation.render();
  state.adapter.value = '';
  await state.foundation.render();
  tick.resolve();
  await first;
  assert.equal(state.svg, '');
  assert.equal(state.svgRequests.length, 0);
});

test('QrCode commits only the newest SVG when encoding finishes out of order', async () => {
  const state = fixture();
  const first = state.foundation.render();
  await Promise.resolve();
  state.adapter.value = 'second';
  const second = state.foundation.render();
  await Promise.resolve();
  state.svgRequests[1].resolve('<svg>second</svg>');
  await second;
  state.svgRequests[0].resolve('<svg>first</svg>');
  await first;
  assert.equal(state.svg, '<svg>second</svg>');
});

test('QrCode ignores obsolete SVG failures and clears current failed output', async () => {
  const state = fixture();
  const first = state.foundation.render();
  await Promise.resolve();
  const second = state.foundation.render();
  await Promise.resolve();
  state.svgRequests[1].resolve('<svg>new</svg>');
  await second;
  state.svgRequests[0].reject(new Error('old'));
  await first;
  assert.equal(state.svg, '<svg>new</svg>');
  const third = state.foundation.render();
  await Promise.resolve();
  state.svgRequests[2].reject(new Error('current'));
  await third;
  assert.equal(state.svg, '');
});

test('QrCode does not commit SVG after switching type or clearing its value', async () => {
  for (const change of ['type', 'value'] as const) {
    const state = fixture();
    const render = state.foundation.render();
    await Promise.resolve();
    if (change === 'type') state.adapter.type = 'canvas';
    else state.adapter.value = '';
    state.svgRequests[0].resolve('<svg>obsolete</svg>');
    await render;
    assert.equal(state.svg, 'previous');
  }
});

test('QrCode copies a completed scratch canvas only into its original current target', async () => {
  const state = fixture();
  state.adapter.type = 'canvas';
  const render = state.foundation.render();
  await Promise.resolve();
  assert.equal(state.draws.length, 0);
  state.canvasRequests[0].resolve();
  await render;
  assert.equal(state.target.width, 180);
  assert.equal(state.target.height, 170);
  assert.deepEqual(state.draws, [[state.scratch, 0, 0]]);
});

test('QrCode discards stale, replaced, hidden and switched canvas targets', async () => {
  for (const change of ['generation', 'target', 'value', 'type'] as const) {
    const state = fixture();
    state.adapter.type = 'canvas';
    const render = state.foundation.render();
    await Promise.resolve();
    if (change === 'generation') {
      state.adapter.value = '';
      await state.foundation.render();
    } else if (change === 'target') state.adapter.canvas = undefined;
    else if (change === 'value') state.adapter.value = '';
    else state.adapter.type = 'svg';
    state.canvasRequests[0].resolve();
    await render;
    assert.equal(state.draws.length, 0, change);
    assert.equal(state.target.width, 0, change);
  }
});

test('QrCode preserves a previous canvas on failure and skips missing targets', async () => {
  const state = fixture();
  state.adapter.type = 'canvas';
  const render = state.foundation.render();
  await Promise.resolve();
  state.canvasRequests[0].reject(new Error('invalid color'));
  await render;
  assert.equal(state.draws.length, 0);
  assert.equal(state.svg, 'previous');
  state.adapter.canvas = undefined;
  await state.foundation.render();
  assert.equal(state.canvasRequests.length, 1);
});

test('QrCode encodes a real SVG through the default engine without DOM globals', async () => {
  let svg = '';
  await createQrCode({
    value: 'SD Foundation\n多行',
    type: 'svg',
    options: getQrCodeOptions(props, 'light'),
    canvas: undefined,
    nextRender: async () => {},
    createCanvas() {
      throw new Error('SVG must not create a canvas');
    },
    setSvg(markup) {
      svg = markup;
    },
  }).render();
  assert.match(svg, /^<svg/);
  assert.match(svg, /width="160"/);
  assert.match(svg, /#0b0b0a/);
});
