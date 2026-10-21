import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { AvatarGroupContext } from '../dist/avatar/types.js';

import {
  createAvatarFoundation,
  getAvatarTriggerIconStyle,
  type AvatarFoundationState,
} from '../dist/avatar/foundation.js';
import { createAvatarGroupFoundation } from '../dist/avatar/group.js';
function fixture() {
  let foundation!: ReturnType<typeof createAvatarFoundation>;
  const queue: (() => void)[] = [],
    events: unknown[][] = [];
  const props: {
    shape: 'circle' | 'square';
    size?: number | undefined;
    autoFixFontSize: boolean;
    imageUrl?: string | undefined;
  } = { shape: 'circle', autoFixFontSize: true };
  const env = {
    group: undefined as AvatarGroupContext | undefined,
    item: undefined as HTMLDivElement | undefined,
    wrapper: undefined as HTMLElement | undefined,
    isImage: false,
    index: -1,
    rtl: false,
  };
  const state: AvatarFoundationState = {
    props,
    get group() {
      return env.group;
    },
    get itemElement() {
      return env.item;
    },
    get wrapperElement() {
      return env.wrapper;
    },
    get mergedSize() {
      return foundation.getMergedSize();
    },
    get mergedAutoFixFontSize() {
      return foundation.getMergedAutoFixFontSize();
    },
    get isImage() {
      return env.isImage;
    },
    get index() {
      return env.index;
    },
    get rtl() {
      return env.rtl;
    },
    hasError: false,
    isLoaded: false,
  };
  foundation = createAvatarFoundation(state, {
    afterRender: (task) => queue.push(task),
    click: (event) => events.push(['click', event]),
    load: () => events.push(['load', state.isLoaded, state.hasError]),
    error: () => events.push(['error', state.hasError, state.isLoaded]),
  });
  const flush = () => queue.splice(0).forEach((task) => task());
  return { foundation, state, props, env, queue, events, flush };
}
const group = (extra: Partial<AvatarGroupContext> = {}): AvatarGroupContext => ({
  size: undefined,
  shape: 'square',
  autoFixFontSize: false,
  zIndexAscend: false,
  total: 3,
  ...extra,
});
const elements = (width = 40, textWidth = 72) => ({
  item: { offsetWidth: width } as HTMLDivElement,
  wrapper: { clientWidth: textWidth, style: { transform: 'old' } } as HTMLElement,
});

test('group overrides preserve false and zero while undefined size falls back to the item', () => {
  const { foundation, props, env } = fixture();
  assert.equal(foundation.getMergedShape(), 'circle');
  assert.equal(foundation.getMergedSize(), undefined);
  assert.equal(foundation.getMergedAutoFixFontSize(), true);
  props.size = 64;
  env.group = group();
  assert.equal(foundation.getMergedShape(), 'square');
  assert.equal(foundation.getMergedSize(), 64);
  assert.equal(foundation.getMergedAutoFixFontSize(), false);
  env.group.size = 0;
  assert.equal(foundation.getMergedSize(), 0);
  env.group = undefined;
  assert.equal(foundation.getMergedSize(), 64);
});
test('group geometry preserves first-item margin, stacking direction and RTL overlap', () => {
  const { foundation, env } = fixture();
  env.group = group({ size: 64 });
  env.index = 0;
  assert.deepEqual(foundation.getOuterStyle(), {
    width: '64px',
    height: '64px',
    fontSize: '32px',
    zIndex: 3,
    marginLeft: '0',
    marginRight: undefined,
  });
  env.index = 1;
  assert.equal(foundation.getOuterStyle().marginLeft, '-16px');
  env.rtl = true;
  env.group.zIndexAscend = true;
  assert.deepEqual(foundation.getOuterStyle(), {
    width: '64px',
    height: '64px',
    fontSize: '32px',
    zIndex: 2,
    marginLeft: '0',
    marginRight: '-16px',
  });
});
test('standalone sizing and omitted group size preserve CSS defaults and zero geometry', () => {
  const { foundation, props, env } = fixture();
  assert.deepEqual(foundation.getOuterStyle(), {});
  props.size = 0;
  assert.deepEqual(foundation.getOuterStyle(), { width: '0px', height: '0px', fontSize: '0px' });
  delete props.size;
  env.group = group();
  env.index = 1;
  assert.equal(foundation.getOuterStyle().marginLeft, '-10px');
});
test('font fitting defers all reads and uses current elements and dimensions when rendered', () => {
  const { foundation, env, queue, flush } = fixture(),
    old = elements();
  Object.assign(env, old);
  foundation.autoFixFontSizeHandler();
  assert.equal(queue.length, 1);
  assert.equal(old.wrapper.style.transform, 'old');
  const fresh = elements(80, 152);
  Object.assign(env, fresh);
  flush();
  assert.equal(old.wrapper.style.transform, 'old');
  assert.equal(fresh.wrapper.style.transform, 'scale(0.5) translateX(-50%)');
});
test('queued font fitting tolerates missing refs and preserves original per-call scheduling', () => {
  const { foundation, env, queue, flush } = fixture(),
    mounted = elements();
  Object.assign(env, mounted);
  foundation.autoFixFontSizeHandler();
  foundation.autoFixFontSizeHandler();
  assert.equal(queue.length, 2);
  env.wrapper = undefined;
  flush();
  assert.equal(mounted.wrapper.style.transform, 'old');
  env.wrapper = mounted.wrapper;
  env.item = undefined;
  foundation.autoFixFontSizeHandler();
  flush();
  assert.equal(mounted.wrapper.style.transform, 'old');
});
test('font fitting clears stale transforms for images, URLs and disabled automatic sizing', () => {
  for (const kind of ['image', 'url', 'disabled']) {
    const { foundation, env, props, flush } = fixture(),
      mounted = elements();
    Object.assign(env, mounted);
    foundation.autoFixFontSizeHandler();
    if (kind === 'image') env.isImage = true;
    else if (kind === 'url') props.imageUrl = 'avatar.png';
    else props.autoFixFontSize = false;
    flush();
    assert.equal(mounted.wrapper.style.transform, '', kind);
  }
});
test('font fit honors explicit zero width and resets short text to unscaled', () => {
  const { foundation, props, env, flush } = fixture(),
    mounted = elements(64, 120);
  Object.assign(env, mounted);
  props.size = 0;
  foundation.autoFixFontSizeHandler();
  flush();
  assert.equal(mounted.wrapper.style.transform, '');
  props.size = 64;
  foundation.autoFixFontSizeHandler();
  flush();
  assert.equal(mounted.wrapper.style.transform, 'scale(0.5) translateX(-50%)');
  Object.assign(mounted.wrapper, { clientWidth: 8 });
  foundation.autoFixFontSizeHandler();
  flush();
  assert.equal(mounted.wrapper.style.transform, '');
});
test('resize schedules fitting only while effective auto-sizing is enabled', () => {
  const { foundation, env, queue } = fixture();
  env.group = group();
  foundation.handleResize();
  assert.equal(queue.length, 0);
  env.group.autoFixFontSize = true;
  foundation.handleResize();
  assert.equal(queue.length, 1);
});
test('image notifications follow state writes and reset clears both flags without notifying', () => {
  const { foundation, state, events } = fixture(),
    event = {} as MouseEvent;
  foundation.onClick(event);
  foundation.handleImgError();
  foundation.handleImgLoad();
  assert.deepEqual(events, [
    ['click', event],
    ['error', true, false],
    ['load', true, true],
  ]);
  assert.equal(state.hasError, true);
  foundation.resetImageState();
  assert.equal(state.hasError, false);
  assert.equal(state.isLoaded, false);
  assert.equal(events.length, 3);
  foundation.handleImgLoad();
  foundation.handleImgError();
  assert.deepEqual(events.at(-1), ['error', true, true]);
});
test('trigger style copies original fields and only derives absent button color from background', () => {
  const trigger = { 'color': '', 'fontSize': 12, '--marker': 'original' },
    inline = { backgroundColor: 'red' };
  const result = getAvatarTriggerIconStyle({
    triggerType: 'button',
    inlineStyle: inline,
    triggerIconStyle: trigger,
  });
  assert.deepEqual(result, { ...trigger, color: 'red' });
  assert.notEqual(result, trigger);
  assert.equal(trigger.color, '');
  assert.equal(
    getAvatarTriggerIconStyle({
      triggerType: 'mask',
      inlineStyle: inline,
      triggerIconStyle: trigger,
    }).color,
    '',
  );
  assert.equal(
    getAvatarTriggerIconStyle({
      triggerType: 'button',
      inlineStyle: inline,
      triggerIconStyle: { color: 'blue' },
    }).color,
    'blue',
  );
  assert.deepEqual(
    getAvatarTriggerIconStyle({
      triggerType: 'button',
      inlineStyle: undefined,
      triggerIconStyle: undefined,
    }),
    {},
  );
});
test('group partitions preserve item identity and original no-limit array reference', () => {
  const props = { maxCount: 0 },
    foundation = createAvatarGroupFoundation(props),
    children = [{ id: 1 }, { id: 2 }, { id: 3 }];
  assert.equal(foundation.getVisibleAvatars(children), children);
  assert.deepEqual(foundation.getOverflowAvatars(children), []);
  props.maxCount = 1;
  assert.deepEqual(foundation.getVisibleAvatars(children), [children[0]]);
  assert.equal(foundation.getOverflowAvatars(children)[0], children[1]);
  props.maxCount = 1.5;
  assert.equal(foundation.getVisibleAvatars(children).length, 1);
  props.maxCount = -1;
  assert.equal(foundation.getVisibleAvatars(children), children);
  props.maxCount = Number.NaN;
  assert.equal(foundation.getVisibleAvatars(children), children);
  assert.equal(typeof globalThis.document, 'undefined');
});
