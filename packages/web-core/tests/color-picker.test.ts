import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createColorPicker, getColorPreviewStyle } from '../dist/color-picker/foundation.js';
import {
  createColorPanel,
  getColorSectionList,
  reconcileGradientState,
} from '../dist/color-picker/panel.js';
import {
  formatColor,
  formatColorState,
  getFormatInputs,
  parseColor,
  parseColorState,
  parseFormatInputValues,
} from '../dist/color-picker/utils.js';

const modes = ['monochrome', 'linear-gradient'] as const;

function picker() {
  const events: unknown[][] = [];
  const adapter = {
    props: {
      modelValue: undefined as string | undefined,
      recentColors: undefined as string[] | undefined,
      disabled: false,
      readonly: false,
      colorModes: [...modes],
      enableAlpha: true,
    },
    value: '#ff000080',
    format: 'HEX8' as const,
    state: parseColorState('#ff000080', [...modes]),
    draft: null as string | null,
    setInner(value: string) {
      events.push(['inner', value]);
    },
    setRecent(value: string[]) {
      events.push(['recent-inner', value]);
    },
    setPopup(value: boolean) {
      events.push(['popup-inner', value]);
    },
    onUpdate(value: string) {
      events.push(['update', value]);
    },
    onChange(value: string, context: { trigger: string }) {
      events.push(['change', value, context.trigger]);
    },
    onClear() {
      events.push(['clear']);
    },
    onRecentChange(value: string[]) {
      events.push(['recent', value]);
    },
    onPopupChange(value: boolean, display: string) {
      events.push(['popup', value, display]);
    },
  };
  return { adapter, events, f: createColorPicker(adapter) };
}

function panel(value = '#ff0000') {
  const pending: Array<() => void> = [];
  const events: unknown[][] = [];
  const adapter = {
    props: {
      value,
      colorModes: [...modes],
      disabled: false,
      enableAlpha: true,
      format: 'HEX8' as const,
      recentColors: [] as string[] | boolean | null,
      swatchColors: null,
      enableMultipleGradient: true,
      onChange(value: string, trigger: string) {
        events.push(['change', value, trigger]);
      },
      onRecentColorsChange(value: string[]) {
        events.push(['recent', value]);
      },
      onPaletteBarChange() {
        events.push(['palette']);
      },
    },
    state: parseColorState(value, [...modes]),
    format: 'HEX8' as import('../src/color-picker/types.ts').ColorFormat,
    drafts: [] as string[],
    afterRender(callback: () => void) {
      pending.push(callback);
    },
    trackRect: () => ({ left: 10, width: 100 }),
    isTrackTarget: () => true,
  };
  const f = createColorPanel(adapter);
  f.syncDrafts();
  return {
    adapter,
    events,
    f,
    flush() {
      pending.splice(0).forEach((cb) => cb());
    },
  };
}

test('color formats retain alpha and HEX8 gives the explicit hex alpha priority', () => {
  const color = parseColor('#ff000080');
  assert.equal(formatColor(color, 'HEX8', true).toLowerCase(), '#ff000080');
  assert.deepEqual(
    getFormatInputs(color, 'HEX8', true).map((x) => x.toLowerCase()),
    ['ff000080', '50%'],
  );
  assert.equal(parseFormatInputValues(['ff000080', '10%'], 'HEX8', true).a, 128 / 255);
  assert.equal(parseFormatInputValues(['ff0000', '10%'], 'HEX8', true).a, 0.1);
});

test('picker keeps input drafts until submission or external synchronization', () => {
  const { f, adapter, events } = picker();
  f.input('unfinished');
  assert.equal(f.display(), 'unfinished');
  f.popup(true);
  assert.deepEqual(events.splice(0), [
    ['popup-inner', true],
    ['popup', true, 'unfinished'],
  ]);
  f.commit('');
  assert.equal(adapter.draft, null);
  assert.deepEqual(events, []);
  f.input('next');
  f.syncValue();
  assert.equal(f.display().toLowerCase(), '#ff000080');
});

test('picker controlled rejection preserves value and clear retains its event order', () => {
  const { f, adapter, events } = picker();
  adapter.props.modelValue = adapter.value;
  f.commit('#00ff00');
  assert.deepEqual(events.splice(0), [
    ['update', '#00FF00FF'],
    ['change', '#00FF00FF', 'input'],
  ]);
  assert.equal(f.display().toLowerCase(), '#ff000080');
  adapter.props.disabled = true;
  f.change('#000000', 'input');
  assert.deepEqual(events, []);
  f.clear({} as MouseEvent);
  assert.deepEqual(events, [['update', ''], ['clear'], ['change', '', 'clear']]);
});

test('recent colors update internal state only when the prop is undefined', () => {
  const { f, adapter, events } = picker();
  const colors = ['red'];
  f.recent(colors);
  assert.deepEqual(events.splice(0), [
    ['recent-inner', colors],
    ['recent', colors],
  ]);
  adapter.props.recentColors = [];
  f.recent(colors);
  assert.deepEqual(events, [['recent', colors]]);
  assert.deepEqual(getColorPreviewStyle(adapter.state), {
    backgroundColor: 'rgba(255, 0, 0, 0.5)',
  });
});

test('panel rolls back rejected changes after rendering and preserves accepted ones', () => {
  const { adapter, f, events, flush } = panel();
  f.handleHueChange(1 / 3);
  assert.equal(adapter.state.hsva.h, 1 / 3);
  assert.equal(events[0][2], 'palette-hue-bar');
  assert.deepEqual(events[1], ['palette']);
  flush();
  assert.equal(adapter.state.hsva.h, 0);
  f.handleHueChange(1 / 3);
  adapter.props.value = String(events.at(-2)![1]);
  flush();
  assert.equal(adapter.state.hsva.h, 1 / 3);
});

test('panel alpha-field commit overrides a stale eight-digit hex draft', () => {
  const { f, adapter, events } = panel('#ff000080');
  f.updateDraft(1, '10%');
  f.commitDrafts(1);
  assert.equal(adapter.state.hsva.a, 0.1);
  assert.equal(events[0][2], 'input');
  f.handleFormatChange('RGBA');
  assert.deepEqual(adapter.drafts, ['255', '0', '0', '10%']);
});

test('gradient reconciliation retains point identity and selected color when stops cross', () => {
  const previous = parseColorState('linear-gradient(90deg, #ff0000 0%, #0000ff 100%)', [...modes]);
  previous.gradientSelectedId = previous.gradientColors[0].id;
  const next = parseColorState('linear-gradient(90deg, #0000ff 10%, #ff0000 90%)', [...modes]);
  const reconciled = reconcileGradientState(previous, next);
  assert.equal(reconciled.gradientColors[0].id, previous.gradientColors[1].id);
  assert.equal(reconciled.gradientColors[1].id, previous.gradientColors[0].id);
  assert.equal(reconciled.gradientSelectedId, previous.gradientSelectedId);
  assert.equal(reconciled.hsva.h, 0);
});

test('gradient track clamps coordinates and keeps at least two stops', () => {
  const { adapter, f, events } = panel('linear-gradient(90deg, #ff0000 0%, #0000ff 100%)');
  f.handleThumbRemove(adapter.state.gradientColors[0].id);
  assert.equal(events.length, 0);
  f.handleGradientBarClick({ clientX: 60 } as MouseEvent);
  assert.equal(adapter.state.gradientColors.length, 3);
  const point = adapter.state.gradientColors.find((point) => point.left === 50)!;
  f.updateThumbLeft(point.id, 200);
  assert.equal(adapter.state.gradientColors.find((p) => p.id === point.id)!.left, 100);
  f.handleThumbRemove(point.id);
  assert.equal(adapter.state.gradientColors.length, 2);
  assert.match(formatColorState(adapter.state, 'CSS', true), /^linear-gradient/);
});

test('disabled panel suppresses updates and recents promote uniquely with an eight-item cap', () => {
  const { adapter, f, events } = panel();
  adapter.props.disabled = true;
  f.handleAlphaChange(0.2);
  f.addRecentColor();
  assert.deepEqual(events, []);
  adapter.props.disabled = false;
  const current = formatColorState(adapter.state, adapter.format, true);
  adapter.props.recentColors = ['a', 'b', current, 'c', 'd', 'e', 'f', 'g', 'h'];
  f.addRecentColor();
  assert.deepEqual(events[0], ['recent', [current, 'a', 'b', 'c', 'd', 'e', 'f', 'g']]);
  assert.deepEqual(
    getColorSectionList(['red', 'linear-gradient(90deg, red, blue)'], ['linear-gradient']),
    ['linear-gradient(90deg, red, blue)'],
  );
});

test('control flushes the last frame after mouseup, cancels on disposal and suppresses drag clicks', async (t) => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const frames = new Map<number, FrameRequestCallback>();
  let id = 0;
  const target = Object.assign(new EventTarget(), {
    requestAnimationFrame(cb: FrameRequestCallback) {
      frames.set(++id, cb);
      return id;
    },
    cancelAnimationFrame(key: number) {
      frames.delete(key);
    },
  });
  Object.defineProperty(globalThis, 'window', { configurable: true, value: target });
  t.after(() => {
    if (descriptor) Object.defineProperty(globalThis, 'window', descriptor);
    else Reflect.deleteProperty(globalThis, 'window');
  });
  const { createColorControl, createGradientThumb, getControlPercent } =
    await import('../dist/color-picker/control.js');
  const changes: number[][] = [];
  const active: boolean[] = [];
  const control = createColorControl({
    block: {
      getBoundingClientRect: () => ({ x: 10, y: 20, width: 100, height: 200 }),
    } as HTMLDivElement,
    value: () => [0, 0],
    onChange: (value) => changes.push(value),
    setActive: (value) => active.push(value),
  });
  control.down({ clientX: 60, clientY: 70, preventDefault() {} } as MouseEvent);
  target.dispatchEvent(new Event('mouseup'));
  for (const [key, cb] of frames) {
    frames.delete(key);
    cb(0);
  }
  assert.deepEqual(changes, [[0.5, 0.25]]);
  assert.deepEqual(active, [true, false]);
  control.down({ clientX: 200, clientY: 0, preventDefault() {} } as MouseEvent);
  control.dispose();
  assert.equal(frames.size, 0);
  assert.ok(Number.isNaN(getControlPercent(0, 0)));
  const calls: unknown[] = [];
  const scheduled: Array<() => void> = [];
  const thumb = createGradientThumb({
    props: {
      onSelect: () => calls.push('select'),
      onMove: (x) => calls.push(x),
      onRemove: () => calls.push('remove'),
    },
    schedule: (cb) => scheduled.push(cb),
  });
  const click = { stopPropagation() {} } as MouseEvent;
  thumb.start();
  thumb.move(80);
  thumb.end();
  thumb.click(click);
  assert.deepEqual(calls, ['select', 80]);
  scheduled[0]();
  thumb.click(click);
  thumb.keydown({ key: 'Delete' } as KeyboardEvent);
  assert.deepEqual(calls, ['select', 80, 'select', 'remove']);
});
