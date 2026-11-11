import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  liquidGlassLogoDefaults,
  normalizeLiquidGlassLogo,
  resolveLiquidGlassLogo,
  getLiquidGlassLogoAutoWidth,
} from '../dist/liquid-glass-logo/foundation.js';

test('参数模块与渲染器可在无 DOM 的环境导入', async () => {
  const { createLiquidGlassLogoRenderer } = await import('../dist/liquid-glass-logo/renderer.js');
  assert.equal(typeof createLiquidGlassLogoRenderer, 'function');
  const { createLiquidGlassLogoAutoWidth } =
    await import('../dist/liquid-glass-logo/auto-width.js');
  assert.equal(typeof createLiquidGlassLogoAutoWidth, 'function');
});

test('自动宽度驱动释放观察器、字体监听与待执行帧，卸载后不回写', async (t) => {
  const { createLiquidGlassLogoAutoWidth } =
    await import('../dist/liquid-glass-logo/auto-width.js');
  let height = '32px';
  let resize = () => {};
  let scheduled: FrameRequestCallback | undefined;
  let disconnected = false;
  let cancelled = 0;
  const listeners = new Set<() => void>();
  const globals = {
    document: {
      fonts: {
        load: async () => [],
        addEventListener: (_name: string, listener: () => void) => listeners.add(listener),
        removeEventListener: (_name: string, listener: () => void) => listeners.delete(listener),
      },
    },
    getComputedStyle: () => ({ height }),
    ResizeObserver: class {
      constructor(callback: () => void) {
        resize = callback;
      }
      observe() {}
      disconnect() {
        disconnected = true;
      }
    },
    requestAnimationFrame: (callback: FrameRequestCallback) => {
      scheduled = callback;
      return 7;
    },
    cancelAnimationFrame: (id: number) => {
      cancelled = id;
    },
  };
  const previous = Object.fromEntries(
    Object.keys(globals).map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]),
  );
  t.after(() => {
    for (const key of Object.keys(globals)) {
      const descriptor = previous[key];
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
  });
  for (const [key, value] of Object.entries(globals))
    Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
  const widths: (number | undefined)[] = [];
  const driver = createLiquidGlassLogoAutoWidth({
    getElement: () => ({}) as HTMLElement,
    getTuning: () => resolveLiquidGlassLogo({ ending: 'logo' }),
    isEnabled: () => true,
    onWidth: (width) => widths.push(width),
  });
  driver.connect();
  await driver.update();
  assert.deepEqual(widths, [41]);
  height = '64px';
  resize();
  assert.ok(scheduled);
  driver.dispose();
  assert.equal(disconnected, true);
  assert.equal(cancelled, 7);
  assert.equal(listeners.size, 0);
  scheduled(0);
  await driver.update();
  assert.deepEqual(widths, [41]);
});

test('自动宽度按高度缩放，并保留动画边缘空间', () => {
  const logo = resolveLiquidGlassLogo({ ending: 'logo', logoSize: 32 });
  assert.equal(getLiquidGlassLogoAutoWidth(logo, 32, 1000), 41);
  const wordmark = resolveLiquidGlassLogo({ ending: 'wordmark', logoSize: 32 });
  assert.equal(getLiquidGlassLogoAutoWidth(wordmark, 32, 120), 98);
  assert.equal(getLiquidGlassLogoAutoWidth(wordmark, 64, 120), 147);
  assert.equal(getLiquidGlassLogoAutoWidth(wordmark, 32, 0), 41);
});

test('默认参数保持独立，未提供的 Vue props 不覆盖默认值', () => {
  const resolved = resolveLiquidGlassLogo({ logoSize: undefined });
  assert.equal(resolved.logoSize, 256);
  assert.equal(resolved.tile, true);
  resolved.logoSize = 32;
  assert.equal(liquidGlassLogoDefaults.logoSize, 256);
});

test('浅色主题和显式颜色的优先级，背景图关闭底板', () => {
  const resolved = resolveLiquidGlassLogo(
    { theme: 'light', textColor: '#123456', tile: true },
    true,
  );
  assert.equal(resolved.background, '#e2e2e5');
  assert.equal(resolved.textColor, '#123456');
  assert.equal(resolved.tile, false);
  assert.equal(resolveLiquidGlassLogo({ tile: false }).tile, false);
});

test('数值限幅并恢复非有限值，避免无效渲染尺寸', () => {
  const resolved = normalizeLiquidGlassLogo({
    ...liquidGlassLogoDefaults,
    logoSize: Infinity,
    maxDpr: 20,
    speed: -1,
    loopDelay: NaN,
    depth: -4,
  });
  assert.equal(resolved.logoSize, 256);
  assert.equal(resolved.maxDpr, 4);
  assert.equal(resolved.speed, 0.1);
  assert.equal(resolved.loopDelay, 1.6);
  assert.equal(resolved.depth, 0);
});

test('theme fallback prioritizes library, page and a single color scheme before browser preference', async (t) => {
  const { getLiquidGlassLogoFallbackTheme: resolve } =
    await import('../dist/liquid-glass-logo/theme.js');
  let page: string | null = null;
  let scheme = 'normal';
  const original = Object.getOwnPropertyDescriptor(globalThis, 'getComputedStyle');
  Object.defineProperty(globalThis, 'getComputedStyle', {
    configurable: true,
    value: () => ({ colorScheme: scheme }),
  });
  t.after(() => {
    if (original) Object.defineProperty(globalThis, 'getComputedStyle', original);
    else Reflect.deleteProperty(globalThis, 'getComputedStyle');
  });
  const element = {
    closest: () => (page ? { getAttribute: () => page } : null),
  } as unknown as HTMLElement;
  assert.equal(resolve(null, undefined, false), 'light');
  assert.equal(resolve(element, undefined, true), 'dark');
  scheme = 'light';
  assert.equal(resolve(element, undefined, true), 'light');
  scheme = 'light dark';
  assert.equal(resolve(element, undefined, true), 'dark');
  page = 'light';
  assert.equal(resolve(element, undefined, true), 'light');
  assert.equal(resolve(element, 'dark', false), 'dark');
});

test('controller reports unavailable WebGL, prevents context-loss default and removes its listener', async (t) => {
  const { createLiquidGlassLogoController } =
    await import('../dist/liquid-glass-logo/controller.js');
  const original = Object.getOwnPropertyDescriptor(globalThis, 'cancelAnimationFrame');
  Object.defineProperty(globalThis, 'cancelAnimationFrame', {
    configurable: true,
    value: () => {},
  });
  t.after(() => {
    if (original) Object.defineProperty(globalThis, 'cancelAnimationFrame', original);
    else Reflect.deleteProperty(globalThis, 'cancelAnimationFrame');
  });
  const canvas = Object.assign(new EventTarget(), { getContext: () => null });
  const errors: string[] = [];
  const controller = createLiquidGlassLogoController({
    getElement: () => null,
    getCanvas: () => canvas as unknown as HTMLCanvasElement,
    getTuning: () => resolveLiquidGlassLogo({}),
    isAutoWidth: () => false,
    onWidth() {},
    onReady() {
      assert.fail('unavailable renderer cannot become ready');
    },
    onError: (error) => errors.push(error.message),
  });
  controller.connect();
  assert.deepEqual(errors, ['WebGL2 is unavailable.']);
  const event = new Event('webglcontextlost', { cancelable: true });
  canvas.dispatchEvent(event);
  assert.equal(event.defaultPrevented, true);
  assert.equal(errors.at(-1), 'WebGL context lost.');
  controller.dispose();
  const after = new Event('webglcontextlost', { cancelable: true });
  canvas.dispatchEvent(after);
  assert.equal(after.defaultPrevented, false);
  assert.equal(errors.length, 2);
  controller.replay();
  controller.seek(1);
  controller.play();
  controller.pause();
});
