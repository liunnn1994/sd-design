import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { CarouselAutoPlayConfig } from '../src/carousel/types.ts';

import {
  createCarousel,
  getCarouselAutoPlay,
  getCarouselIndexes,
  getValidCarouselIndex,
} from '../dist/carousel/foundation.js';
import { createCarouselIndicator, getCarouselSliderStyle } from '../dist/carousel/indicator.js';
import { getCarouselAnimationStyle, getCarouselItemState } from '../dist/carousel/item.js';

function carousel() {
  let id = 0;
  const intervals = new Map<number, { callback: () => void; delay: number | undefined }>();
  const timeouts = new Map<number, { callback: () => void; delay: number }>();
  const events: unknown[][] = [];
  const adapter = {
    props: { current: undefined as number | undefined, moveSpeed: 500 },
    count: 3,
    innerIndex: 0,
    previousIndex: undefined as number | undefined,
    slideDirection: undefined as 'positive' | 'negative' | undefined,
    paused: false,
    autoPlay: getCarouselAutoPlay(false),
    get indexes() {
      return getCarouselIndexes(this.props.current, this.innerIndex, this.count);
    },
    setInterval(callback: () => void, delay: number | undefined) {
      intervals.set(++id, { callback, delay });
      return id;
    },
    clearInterval(timer: number) {
      intervals.delete(timer);
    },
    setTimeout(callback: () => void, delay: number) {
      timeouts.set(++id, { callback, delay });
      return id;
    },
    clearTimeout(timer: number) {
      timeouts.delete(timer);
    },
    onUpdate(index: number) {
      events.push(['update', index]);
    },
    onChange(index: number, previous: number, manual: boolean) {
      events.push(['change', index, previous, manual]);
    },
  };
  return {
    adapter,
    intervals,
    timeouts,
    events,
    f: createCarousel(adapter),
    unlock() {
      for (const [key, value] of timeouts) {
        timeouts.delete(key);
        value.callback();
      }
    },
  };
}

test('carousel index normalization preserves 1-based controlled conversion and negative wrapping', () => {
  assert.equal(getValidCarouselIndex(-8, 3), 1);
  assert.equal(getValidCarouselIndex(4.9, 3), 1);
  assert.equal(getValidCarouselIndex(Infinity, 3), 0);
  assert.equal(getValidCarouselIndex(2, 0), 0);
  assert.deepEqual(getCarouselIndexes(-7, 0, 3), {
    mergedIndex: 1,
    mergedPrevIndex: 0,
    mergedNextIndex: 2,
  });
  assert.equal(getCarouselIndexes(NaN, 2, 3).mergedIndex, 2);
});

test('autoplay config preserves defaults, false and explicit undefined overrides', () => {
  assert.deepEqual(getCarouselAutoPlay(false), {});
  assert.deepEqual(getCarouselAutoPlay(true), { interval: 3000, hoverToPause: true });
  assert.deepEqual(getCarouselAutoPlay({ interval: 100, hoverToPause: false }), {
    interval: 100,
    hoverToPause: false,
  });
  const explicit = { interval: undefined } as unknown as CarouselAutoPlayConfig;
  assert.equal(getCarouselAutoPlay(explicit).interval, undefined);
});

test('manual navigation writes transition state before update/change and locks until timeout', () => {
  const { adapter, events, timeouts, f, unlock } = carousel();
  f.prev();
  assert.equal(adapter.innerIndex, 2);
  assert.equal(adapter.previousIndex, 0);
  assert.equal(adapter.slideDirection, 'negative');
  assert.deepEqual(events, [
    ['update', 3],
    ['change', 3, 1, true],
  ]);
  assert.equal([...timeouts.values()][0].delay, 500);
  f.next();
  assert.equal(events.length, 2);
  unlock();
  f.next();
  assert.deepEqual(events.slice(2), [
    ['update', 1],
    ['change', 1, 3, true],
  ]);
});

test('controlled rejection dedupes the requested target while previous remains the displayed slide', () => {
  const { adapter, events, f, unlock } = carousel();
  adapter.props.current = 3;
  f.syncIndex();
  f.next();
  assert.equal(adapter.indexes.mergedIndex, 2);
  assert.equal(adapter.innerIndex, 0);
  unlock();
  f.next();
  assert.deepEqual(events, [
    ['update', 1],
    ['change', 1, 3, true],
  ]);
  adapter.props.current = 1;
  f.syncIndex();
  f.next();
  assert.deepEqual(events.slice(2), [
    ['update', 2],
    ['change', 2, 1, true],
  ]);
});

test('indicator selection uses shortest direction and goTo keeps 1-based wrapping', () => {
  const { adapter, f, unlock } = carousel();
  adapter.count = 5;
  adapter.innerIndex = 4;
  f.select(0);
  assert.equal(adapter.slideDirection, 'positive');
  unlock();
  f.select(4);
  assert.equal(adapter.slideDirection, 'negative');
  unlock();
  f.goTo(-7);
  assert.equal(adapter.innerIndex, 2);
});

test('child count changes normalize active state and empty/single carousels do not navigate', () => {
  const { adapter, events, f } = carousel();
  adapter.innerIndex = 2;
  adapter.count = 2;
  f.syncIndex();
  assert.equal(adapter.innerIndex, 0);
  adapter.count = 0;
  f.next();
  f.goTo(3);
  f.select(1);
  f.syncIndex();
  adapter.count = 1;
  f.prev();
  assert.deepEqual(events, []);
});

test('autoplay rescheduling preserves animation lock and captures the next index for that interval', () => {
  const { adapter, f, events, intervals, timeouts, unlock } = carousel();
  adapter.autoPlay = getCarouselAutoPlay({ interval: 100 });
  f.syncAutoPlay();
  assert.equal([...intervals.values()][0].delay, 100);
  [...intervals.values()][0].callback();
  assert.deepEqual(events, [
    ['update', 2],
    ['change', 2, 1, false],
  ]);
  f.syncAutoPlay();
  assert.equal(intervals.size, 1);
  assert.equal(timeouts.size, 1);
  [...intervals.values()][0].callback();
  assert.equal(events.length, 2);
  unlock();
  [...intervals.values()][0].callback();
  assert.deepEqual(events.slice(2), [
    ['update', 3],
    ['change', 3, 2, false],
  ]);
  f.dispose();
  assert.equal(intervals.size, 0);
  assert.equal(timeouts.size, 0);
});

test('hover pause, live config changes and disposal retain independent timer lifetimes', () => {
  const { adapter, f, intervals, timeouts } = carousel();
  adapter.autoPlay = getCarouselAutoPlay(true);
  f.syncAutoPlay();
  f.enter();
  f.syncAutoPlay();
  assert.equal(intervals.size, 0);
  adapter.autoPlay = getCarouselAutoPlay({ interval: 30, hoverToPause: false });
  f.syncAutoPlay();
  assert.equal(intervals.size, 1);
  f.next();
  f.leave();
  f.syncAutoPlay();
  assert.equal(timeouts.size, 1);
  f.dispose();
  f.dispose();
  assert.equal(intervals.size + timeouts.size, 0);
});

test('carousel keyboard leaves editable descendants untouched and forwards both axis directions', () => {
  const { f, adapter, unlock } = carousel();
  let prevented = 0;
  const event = (key: string, editable = false) =>
    ({
      key,
      target: { closest: () => editable },
      preventDefault() {
        prevented++;
      },
    }) as unknown as KeyboardEvent;
  f.keydown(event('ArrowRight', true));
  assert.equal(adapter.innerIndex, 0);
  assert.equal(prevented, 0);
  f.keydown(event('ArrowDown'));
  assert.equal(adapter.innerIndex, 1);
  unlock();
  f.keydown(event('ArrowUp'));
  assert.equal(adapter.innerIndex, 0);
  assert.equal(prevented, 2);
});

test('indicator delegation ignores active/invalid targets and slider children while retaining keyboard activation', () => {
  const props = { type: 'dot' as 'dot' | 'slider', count: 5, activeIndex: 0 };
  const calls: number[] = [];
  let prevented = 0;
  const f = createCarouselIndicator({ props, onSelect: (index) => calls.push(index) });
  const track = { clientWidth: 100 };
  const target = (data: string | null) => ({ getAttribute: () => data });
  const event = (node: unknown, offsetX = 50) =>
    ({
      target: node,
      currentTarget: track,
      offsetX,
      preventDefault() {
        prevented++;
      },
    }) as unknown as MouseEvent;
  f.click(event(target('0')));
  f.click(event(target(null)));
  f.click(event(target('3')));
  props.type = 'slider';
  f.click(event(target('2')));
  f.click(event(track));
  f.keydown(
    {
      key: ' ',
      preventDefault() {
        prevented++;
      },
    } as KeyboardEvent,
    4,
  );
  assert.deepEqual(calls, [3, 2, 4]);
  assert.equal(prevented, 6);
  assert.deepEqual(getCarouselSliderStyle(5, 2), { width: '20%', left: '40%' });
});

test('item transition flags and timing preserve current/adjacent and outgoing slide semantics', () => {
  const context = {
    mergedIndexes: getCarouselIndexes(2, 0, 3),
    previousIndex: 0,
    animationName: 'slide',
    slideDirection: 'positive',
  };
  assert.deepEqual(getCarouselItemState(0, context), {
    current: false,
    prev: true,
    next: false,
    slideIn: false,
    slideOut: true,
  });
  assert.equal(getCarouselItemState(1, context).slideIn, true);
  assert.equal(getCarouselItemState(1, { ...context, animationName: 'fade' }).slideIn, false);
  assert.equal(getCarouselItemState(-1, {}).current, false);
  assert.deepEqual(getCarouselAnimationStyle('ease-in', 800), {
    transitionTimingFunction: 'ease-in',
    transitionDuration: '800ms',
    animationTimingFunction: 'ease-in',
    animationDuration: '800ms',
  });
});
