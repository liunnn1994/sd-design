import { config } from '@vue/test-utils';
import type { AppConfig } from 'vue';

import { afterEach, vi } from 'vitest';

// Normalize timezone so snapshot tests produce consistent results
// regardless of local timezone (e.g. UTC+8 locally vs UTC+0 in CI).
process.env.TZ = 'UTC';

import SDVue from './components';
import SDVueIcon from './components/icon';

const mockCanvasContext = {
  save: vi.fn(),
  restore: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
  drawImage: vi.fn(),
  fillText: vi.fn(),
  measureText: vi.fn((text) => ({ width: text.length * 8 })),
  getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4) })),
  putImageData: vi.fn(),
  globalAlpha: 1,
  font: '',
  fillStyle: '',
  textAlign: 'left',
  textBaseline: 'alphabetic',
};

config.global.plugins = [SDVue, SDVueIcon];

const globalProperties =
  config.global.config?.globalProperties ?? ({} as AppConfig['globalProperties']);
Object.assign(globalProperties, {
  $sd: {
    classPrefix: 'sd',
  },
});

config.global.config = {
  ...config.global.config,
  globalProperties,
};
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

Object.defineProperty(globalThis, 'Element', {
  configurable: true,
  value: window.Element,
});

vi.mock('resize-observer-polyfill', () => ({
  __esModule: true,
  default: class MockResizeObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  },
}));

// virtua reads the global `ResizeObserver` (jsdom does not provide one, and the
// app does not globally polyfill it). Provide a mock so virtualized components
// initialize without throwing. jsdom has no layout, so for elements inside a
// virtual-list we fabricate sizes (viewport from the host height, items at a
// fixed size) to let virtua compute a visible range and render items; for every
// other element it behaves as a no-op, leaving non-virtual components untouched.
const VIRTUA_ITEM_SIZE = 32;
class MockGlobalResizeObserver {
  callback: ResizeObserverCallback;
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }
  observe = (target: Element) => {
    if (!(target instanceof HTMLElement)) {
      return;
    }
    const root = target.closest('.sd-virtual-list') as HTMLElement | null;
    if (!root) {
      return;
    }
    // virtua ignores ResizeObserver entries whose `offsetParent` is null (it
    // treats them as not laid out). jsdom always returns null, so virtua would
    // never adopt a viewport size and would render zero items. Patch the
    // instance so virtua considers it visible.
    if (target.offsetParent == null) {
      Object.defineProperty(target, 'offsetParent', {
        configurable: true,
        value: document.body,
      });
    }
    const isViewport = target.classList.contains('sd-virtual-list-scroller');
    const hostHeight = parseFloat(root.style.height || '') || 300;
    const blockSize = isViewport ? hostHeight : VIRTUA_ITEM_SIZE;
    const inlineSize = 200;
    const entry = {
      target,
      contentRect: {
        width: inlineSize,
        height: blockSize,
        top: 0,
        left: 0,
        bottom: blockSize,
        right: inlineSize,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      },
      borderBoxSize: [{ blockSize, inlineSize }],
      contentBoxSize: [{ blockSize, inlineSize }],
      devicePixelContentBoxSize: [{ blockSize, inlineSize }],
    };
    // Fire asynchronously, like the real ResizeObserver. Tests flush the
    // resulting measure->render chain with a macrotask await.
    queueMicrotask(() => {
      try {
        this.callback([entry as unknown as ResizeObserverEntry], this as unknown as ResizeObserver);
      } catch {
        // ignore callback errors during teardown
      }
    });
  };
  unobserve = vi.fn();
  disconnect = vi.fn();
}
Object.defineProperty(globalThis, 'ResizeObserver', {
  configurable: true,
  writable: true,
  value: MockGlobalResizeObserver,
});
Object.defineProperty(window, 'ResizeObserver', {
  configurable: true,
  writable: true,
  value: MockGlobalResizeObserver,
});

Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  configurable: true,
  value: vi.fn(() => mockCanvasContext),
});

Object.defineProperty(HTMLCanvasElement.prototype, 'toDataURL', {
  configurable: true,
  value: vi.fn(() => 'data:image/png;base64,mock'),
});

afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
  vi.clearAllTimers();
});
