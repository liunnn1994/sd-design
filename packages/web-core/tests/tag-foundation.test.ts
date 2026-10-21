import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createTagFoundation, type TagFoundationState } from '../dist/tag/foundation.js';
import { TAG_COLORS } from '../dist/tag/types.js';
interface Tooltip {
  always?: boolean;
  disabled?: boolean;
  contentStyle?: { color: string };
  marker?: object;
}
function fixture(props: Partial<TagFoundationState<Tooltip>['props']> = {}) {
  let foundation!: ReturnType<typeof createTagFoundation<Tooltip, string>>;
  const events: unknown[][] = [];
  const state: TagFoundationState<Tooltip> = {
    props: { ellipsisTooltip: true, ...props },
    visible: true,
    checked: true,
    size: 'medium',
    get isBuiltInColor() {
      return foundation.getIsBuiltInColor();
    },
    get isCustomColor() {
      return foundation.getIsCustomColor();
    },
    get resolvedColor() {
      return foundation.getResolvedColor();
    },
    get isGradientColor() {
      return foundation.getIsGradientColor();
    },
    get resolvedBackgroundColor() {
      return foundation.getResolvedBackgroundColor();
    },
    get autoTextColor() {
      return foundation.getAutoTextColor();
    },
    get finalTextColor() {
      return foundation.getFinalTextColor();
    },
    get colorAlpha() {
      return foundation.getColorAlpha();
    },
    get finalBackgroundAlpha() {
      return foundation.getFinalBackgroundAlpha();
    },
    get computedChecked() {
      return foundation.getComputedChecked();
    },
    get resolvedEllipsis() {
      return foundation.getResolvedEllipsis();
    },
    get shouldRenderEllipsis() {
      return foundation.getShouldRenderEllipsis();
    },
    get hasCustomTooltip() {
      return foundation.getHasCustomTooltip();
    },
    hasDefaultSlot: true,
    hasTooltipSlot: false,
  };
  foundation = createTagFoundation(state, {
    updateVisible(value) {
      events.push(['visible', value, state.visible]);
    },
    updateChecked(value) {
      events.push(['checked', value, state.checked]);
    },
    close(event) {
      events.push(['close', event]);
    },
    check(value, event) {
      events.push(['check', value, event]);
    },
  });
  return { state, foundation, events };
}
function keyboard(key: string) {
  let prevented = 0;
  const event = {
    key,
    preventDefault() {
      prevented++;
    },
  } as KeyboardEvent;
  return { event, prevented: () => prevented };
}

test('controlled close records fallback before update then close and releases without reopening', () => {
  const { state, foundation, events } = fixture({ visible: true });
  const event = {} as MouseEvent;
  foundation.handleClose(event);
  assert.deepEqual(events, [
    ['visible', false, false],
    ['close', event],
  ]);
  assert.equal(foundation.getComputedVisible(), true);
  delete state.props.visible;
  assert.equal(foundation.getComputedVisible(), false);
});
test('check requests respect controlled ownership and retain fallback after release', () => {
  const { state, foundation, events } = fixture({ checkable: true, checked: false });
  const event = {} as MouseEvent;
  foundation.handleClick(event);
  foundation.handleClick(event);
  assert.deepEqual(events, [
    ['checked', true, true],
    ['check', true, event],
    ['checked', true, true],
    ['check', true, event],
  ]);
  assert.equal(state.computedChecked, false);
  delete state.props.checked;
  assert.equal(state.computedChecked, true);
  foundation.handleClick(event);
  assert.equal(state.computedChecked, false);
  state.props.checkable = false;
  events.length = 0;
  foundation.handleClick(event);
  assert.deepEqual(events, []);
  assert.equal(state.computedChecked, true);
  assert.equal(state.checked, false);
});
test('close and check keyboard handlers retain exact Enter and space activation', () => {
  for (const key of ['Escape', 'Space', 'Spacebar', 'Tab']) {
    const { foundation, events } = fixture({ checkable: true });
    const k = keyboard(key);
    foundation.handleCloseKeydown(k.event);
    foundation.handleTagKeydown(k.event);
    assert.equal(k.prevented(), 0);
    assert.deepEqual(events, []);
  }
  for (const key of ['Enter', ' ']) {
    const { foundation, events } = fixture({ checkable: true });
    const k = keyboard(key);
    foundation.handleTagKeydown(k.event);
    assert.equal(k.prevented(), 1);
    assert.equal(events.length, 2);
    foundation.handleCloseKeydown(k.event);
    assert.equal(k.prevented(), 2);
    assert.equal(events.length, 4);
  }
  const { foundation, events } = fixture();
  const k = keyboard('Enter');
  foundation.handleTagKeydown(k.event);
  assert.equal(k.prevented(), 0);
  assert.deepEqual(events, []);
});
test('ellipsis precedence, live slot presence, zero line clamp and mini size remain distinct', () => {
  const { state, foundation } = fixture({ nowrap: false });
  assert.equal(state.shouldRenderEllipsis, false);
  state.props.ellipsis = true;
  assert.equal(state.shouldRenderEllipsis, true);
  assert.equal(foundation.getHasLineClampEllipsis(), false);
  state.props.ellipsisLineClamp = 0;
  assert.equal(foundation.getHasLineClampEllipsis(), true);
  Object.assign(state, { hasDefaultSlot: false, size: 'mini' });
  assert.equal(state.shouldRenderEllipsis, false);
  assert.equal(foundation.getMergedSize(), 'small');
  Object.assign(state, { size: 'large' });
  assert.equal(foundation.getMergedSize(), 'large');
  delete state.props.ellipsis;
  delete state.props.nowrap;
  assert.equal(state.resolvedEllipsis, true);
});
test('custom tooltip clones only when needed and preserves opaque data and explicit disabling', () => {
  const marker = {},
    contentStyle = { color: 'red' },
    tooltip = { always: false, disabled: true, marker, contentStyle };
  const { state, foundation } = fixture({ ellipsisTooltip: tooltip });
  assert.equal(foundation.getMergedEllipsisTooltip(), tooltip);
  Object.assign(state, { hasTooltipSlot: true });
  const merged = foundation.getMergedEllipsisTooltip();
  assert.notEqual(merged, tooltip);
  assert.deepEqual(merged, { ...tooltip, always: true });
  assert.equal(tooltip.always, false);
  const bindings = foundation.getTooltipBindings();
  assert.deepEqual(bindings, { disabled: true, marker, contentStyle });
  assert.equal('always' in bindings, false);
  assert.equal(bindings.marker, marker);
  assert.equal(bindings.contentStyle, contentStyle);
  Object.assign(state.props, { ellipsisTooltip: false });
  assert.equal(foundation.getMergedEllipsisTooltip(), false);
  assert.deepEqual(foundation.getTooltipBindings(), {});
  Object.assign(state.props, { ellipsisTooltip: true });
  assert.deepEqual(foundation.getMergedEllipsisTooltip(), { always: true });
  Object.assign(state, { hasTooltipSlot: false });
  state.props.tooltip = '';
  assert.equal(state.hasCustomTooltip, false);
  state.props.tooltip = 'Title';
  assert.equal(state.hasCustomTooltip, true);
});
test('built-in colors and empty color preserve falsy sentinels without DOM access', () => {
  assert.equal(typeof globalThis.document, 'undefined');
  for (const color of TAG_COLORS) {
    const { state, foundation } = fixture({ color });
    assert.equal(state.isBuiltInColor, true);
    assert.equal(state.isCustomColor, false);
    assert.equal(state.autoTextColor, undefined);
    assert.equal(foundation.getResolvedBackgroundColor(), undefined);
  }
  const { state } = fixture({ color: '' });
  assert.equal(state.isBuiltInColor, '');
  assert.equal(state.isCustomColor, '');
  assert.equal(state.resolvedColor, '');
  assert.equal(state.autoTextColor, undefined);
  delete state.props.color;
  assert.equal(state.isBuiltInColor, undefined);
});
test('native color resolution preserves read/append/remove order and raw fallback on failure', () => {
  const { state } = fixture({ color: 'rebeccapurple' });
  const calls: unknown[] = [];
  const element = { style: { color: '' } };
  const oldDocument = Object.getOwnPropertyDescriptor(globalThis, 'document'),
    oldWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  try {
    Object.defineProperty(globalThis, 'document', {
      configurable: true,
      value: {
        createElement(tag: string) {
          calls.push(['create', tag]);
          return element;
        },
        body: {
          appendChild(node: unknown) {
            calls.push(['append', node]);
          },
          removeChild(node: unknown) {
            calls.push(['remove', node]);
          },
        },
      },
    });
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: {
        getComputedStyle(node: unknown) {
          calls.push(['read', node]);
          return { color: 'rgb(102, 51, 153)' };
        },
      },
    });
    assert.equal(state.resolvedColor, 'rgb(102, 51, 153)');
    assert.equal(element.style.color, 'rebeccapurple');
    assert.deepEqual(calls, [
      ['create', 'div'],
      ['append', element],
      ['read', element],
      ['remove', element],
    ]);
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: {
        getComputedStyle() {
          throw Error('unavailable');
        },
      },
    });
    assert.equal(state.resolvedColor, 'rebeccapurple');
  } finally {
    if (oldDocument) Object.defineProperty(globalThis, 'document', oldDocument);
    else Reflect.deleteProperty(globalThis, 'document');
    if (oldWindow) Object.defineProperty(globalThis, 'window', oldWindow);
    else Reflect.deleteProperty(globalThis, 'window');
  }
});
test('text contrast picks readable black/white and honors empty explicit text color', () => {
  const dark = fixture({ color: '#000001' }),
    light = fixture({ color: '#ffffff' });
  assert.equal(dark.state.autoTextColor, '#FFFFFF');
  assert.equal(light.state.autoTextColor, '#1D2129');
  light.state.props.textColor = '';
  assert.equal(light.state.finalTextColor, '');
  light.state.props.textColor = 'pink';
  assert.equal(light.state.finalTextColor, 'pink');
});
test('border ownership, explicit zero alpha and intrinsic alpha retain original precedence', () => {
  const { state, foundation } = fixture({ color: 'rgba(10, 20, 30, 0.25)', backgroundAlpha: 0 });
  assert.equal(state.colorAlpha, 0.25);
  assert.equal(state.finalBackgroundAlpha, 1);
  assert.equal(foundation.getBackgroundColor(), 'rgb(10 20 30)');
  state.props.bordered = false;
  assert.equal(state.finalBackgroundAlpha, 0);
  assert.equal(foundation.getBackgroundColor(), 'rgb(10 20 30 / 0)');
  delete state.props.backgroundAlpha;
  assert.equal(state.finalBackgroundAlpha, 0.25);
  assert.equal(foundation.getBackgroundColor(), 'rgb(10 20 30 / 0.25)');
  state.props.color = '#010203';
  assert.equal(state.colorAlpha, undefined);
  assert.equal(state.finalBackgroundAlpha, 0.8);
});
test('gradients average colors and invalid colors retain fallback strings', () => {
  const { state, foundation } = fixture({
    color: 'linear-gradient(90deg, #000000, #ffffff)',
    bordered: true,
  });
  assert.equal(state.isGradientColor, true);
  assert.equal(state.colorAlpha, undefined);
  assert.equal(foundation.getBackgroundColor(), 'rgb(128 128 128 / 0.8)');
  state.props.color = 'not-a-color';
  assert.equal(state.resolvedColor, 'not-a-color');
  assert.equal(state.autoTextColor, '#FFFFFF');
  assert.equal(foundation.getBackgroundColor(), 'not-a-color');
});
