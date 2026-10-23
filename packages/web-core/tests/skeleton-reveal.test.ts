import assert from 'node:assert/strict';
import { test } from 'node:test';

import type {
  SkeletonRevealAdapter,
  SkeletonRevealAnimationOptions,
} from '../dist/skeleton-reveal/types.js';

import { createSkeletonRevealFoundation } from '../dist/skeleton-reveal/foundation.js';
import { measureSkeletonReveal } from '../dist/skeleton-reveal/geometry.js';

class MeasuredElement extends EventTarget {
  style = { opacity: '1' };
  reads = 0;
  children: MeasuredElement[] = [];
  rect: { x: number; y: number; width: number; height: number };
  constructor(rect = { x: 10, y: 20, width: 300, height: 100 }) {
    super();
    this.rect = rect;
  }
  getBoundingClientRect() {
    this.reads++;
    return this.rect;
  }
  querySelectorAll() {
    return this.children;
  }
}

function fixture() {
  let intersect = (_entries: { isIntersecting: boolean }[]) => {};
  let resize = (_entries: { contentRect: { width: number; height: number } }[]) => {};
  const disconnected: string[] = [];
  const document = Object.assign(new EventTarget(), {
    hidden: false,
    defaultView: {
      IntersectionObserver: class {
        constructor(callback: typeof intersect) {
          intersect = callback;
        }
        observe() {}
        disconnect() {
          disconnected.push('intersection');
        }
      },
      ResizeObserver: class {
        constructor(callback: typeof resize) {
          resize = callback;
        }
        observe() {}
        disconnect() {
          disconnected.push('resize');
        }
      },
    },
  });
  const root = Object.assign(new MeasuredElement(), { ownerDocument: document });
  const body = new MeasuredElement();
  body.children = [new MeasuredElement({ x: 30, y: 40, width: 100, height: 20 })];
  const overlay = { querySelectorAll: () => adapter.shapes.map(() => new MeasuredElement()) };
  const calls: { element: Element; options: SkeletonRevealAnimationOptions; cancelled: boolean }[] =
    [];
  let finishes = 0;
  let hasOverlay = true;
  const adapter: SkeletonRevealAdapter = {
    props: { duration: 1600, autoplay: true, disabled: false },
    reducedMotion: false,
    root: root as unknown as HTMLElement,
    content: body as unknown as HTMLElement,
    get overlay() {
      return hasOverlay ? (overlay as unknown as SVGSVGElement) : null;
    },
    state: 'idle',
    shapes: [],
    box: { width: 1, height: 1 },
    afterRender: async () => {},
    animate(element, _values, options) {
      const call = { element, options, cancelled: false };
      calls.push(call);
      return {
        cancel() {
          call.cancelled = true;
        },
      };
    },
    onFinish() {
      finishes++;
    },
  };
  const foundation = createSkeletonRevealFoundation(adapter);
  return {
    foundation,
    adapter,
    root,
    body,
    calls,
    document,
    disconnected,
    get finishes() {
      return finishes;
    },
    setOverlay(value: boolean) {
      hasOverlay = value;
    },
    enter(value: boolean) {
      intersect([{ isIntersecting: value }]);
    },
    size(width: number, height: number) {
      resize([{ contentRect: { width, height } }]);
    },
  };
}

test('geometry is relative to content and measures no more than 24 outlines', () => {
  const body = new MeasuredElement();
  body.children = Array.from(
    { length: 100 },
    () => new MeasuredElement({ x: 30, y: 40, width: 100, height: 20 }),
  );
  const geometry = measureSkeletonReveal(body as unknown as HTMLElement)!;
  assert.deepEqual(geometry.box, { width: 300, height: 100 });
  assert.equal(geometry.shapes.length, 24);
  assert.deepEqual(geometry.shapes[1], { x: 21, y: 21, width: 98, height: 18, radius: 8 });
  assert.equal(body.reads, 2); // content bounds plus its own outline
  assert.equal(
    body.children.reduce((sum, child) => sum + child.reads, 0),
    23,
  );
  body.rect.width = 0;
  assert.equal(measureSkeletonReveal(body as unknown as HTMLElement), undefined);
});

test('connecting with reduced motion reveals pending content before any intersection', () => {
  const f = fixture();
  Object.defineProperty(f.adapter, 'reducedMotion', { value: true });
  f.body.style.opacity = '0';
  f.foundation.connect();
  assert.equal(f.adapter.state, 'complete');
  assert.equal(f.body.style.opacity, '1');
  assert.equal(f.calls.length, 0);
  f.foundation.dispose();
});

test('playback uses the animation port, preserves timings, and releases every effect on completion', async () => {
  const f = fixture();
  await f.foundation.replay();
  assert.equal(f.adapter.state, 'drawing');
  assert.equal(f.body.style.opacity, '0');
  assert.equal(f.calls.length, 4);
  assert.equal(f.calls[0].options.duration, 1.6 * 0.72);
  assert.equal(f.calls[1].options.delay, (1 / 2) * 1.6 * 0.16);
  assert.equal(f.calls[2].options.delay, 1.6 * 0.58);
  f.calls.at(-1)!.options.onComplete!();
  assert.equal(f.adapter.state, 'complete');
  assert.equal(f.body.style.opacity, '1');
  assert.deepEqual(f.adapter.shapes, []);
  assert.ok(f.calls.every((call) => call.cancelled));
  assert.equal(f.finishes, 1);
  f.foundation.finish();
  assert.equal(f.finishes, 1);
});

test('invalid duration, disabled, hidden and reduced-motion playback do not measure or animate', async () => {
  for (const duration of [0, -1, NaN, Infinity]) {
    const f = fixture();
    f.adapter.props.duration = duration;
    await f.foundation.replay();
    assert.equal(f.calls.length, 0);
    assert.equal(f.body.reads, 0);
  }
  for (const kind of ['disabled', 'hidden', 'reduced'] as const) {
    const f = fixture();
    if (kind === 'disabled') f.adapter.props.disabled = true;
    else if (kind === 'hidden') f.document.hidden = true;
    else Object.defineProperty(f.adapter, 'reducedMotion', { value: true });
    await f.foundation.replay();
    assert.equal(f.calls.length, 0);
    assert.equal(f.body.reads, 0);
  }
  const f = fixture();
  f.adapter.props.duration = 20000;
  await f.foundation.replay();
  assert.equal(f.calls.at(-1)!.options.duration, 10 * 0.35);
});

test('racing replays and an interrupted render commit cannot hide content or start stale effects', async () => {
  const f = fixture();
  const renders: (() => void)[] = [];
  f.adapter.afterRender = () => new Promise<void>((resolve) => renders.push(resolve));
  const first = f.foundation.replay();
  const second = f.foundation.replay();
  renders.shift()!();
  await first;
  assert.equal(f.adapter.state, 'complete');
  renders.shift()!();
  await Promise.resolve();
  assert.equal(f.adapter.state, 'drawing');
  f.foundation.finish();
  renders.shift()!();
  await second;
  assert.equal(f.calls.length, 0);
  assert.equal(f.body.style.opacity, '1');
});

test('a missing rendered SVG restores content instead of leaving it invisible', async () => {
  const f = fixture();
  f.setOverlay(false);
  await f.foundation.replay();
  assert.equal(f.adapter.state, 'complete');
  assert.equal(f.body.style.opacity, '1');
  assert.deepEqual(f.adapter.shapes, []);
});

test('native visibility and interaction rules stop playback, while autoplay only runs once', async () => {
  const f = fixture();
  f.foundation.connect();
  f.enter(true);
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(f.adapter.state, 'drawing');
  f.enter(false);
  assert.equal(f.adapter.state, 'complete');
  const effects = f.calls.length;
  f.enter(true);
  await Promise.resolve();
  assert.equal(f.calls.length, effects);
  for (const event of ['pointerdown', 'keydown', 'focusin']) {
    await f.foundation.replay();
    f.root.dispatchEvent(new Event(event));
    assert.equal(f.adapter.state, 'complete', event);
  }
  await f.foundation.replay();
  f.document.hidden = true;
  f.document.dispatchEvent(new Event('visibilitychange'));
  assert.equal(f.adapter.state, 'complete');
  f.foundation.dispose();
  assert.deepEqual(f.disconnected, ['intersection', 'resize']);
});

test('resize tolerance, option changes, stale completions and disposal preserve usable content', async () => {
  const f = fixture();
  f.foundation.connect();
  f.size(300, 100);
  await f.foundation.replay();
  f.size(300.5, 100.5);
  assert.equal(f.adapter.state, 'drawing');
  f.size(310, 100);
  assert.equal(f.adapter.state, 'complete');
  await f.foundation.replay();
  const oldCompletion = f.calls.at(-1)!.options.onComplete!;
  await f.foundation.replay();
  oldCompletion();
  assert.equal(f.adapter.state, 'drawing');
  f.adapter.props.disabled = true;
  f.foundation.syncOptions();
  assert.equal(f.adapter.state, 'complete');
  f.adapter.props.disabled = false;
  await f.foundation.replay();
  const finishes = f.finishes;
  f.foundation.dispose();
  assert.equal(f.finishes, finishes);
  assert.equal(f.body.style.opacity, '1');
  assert.ok(f.calls.every((call) => call.cancelled));
  await f.foundation.replay();
  assert.equal(f.adapter.state, 'complete');
});
