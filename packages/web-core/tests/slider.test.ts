import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { SliderOptions, SliderValue } from '../src/slider/types.ts';

import {
  getSliderInitialValues,
  getOffsetPercent,
  getPositionStyle,
  getSliderBarStyle,
  getSliderValueByCoords,
  getSliderTicks,
  getSliderMarks,
  getSliderInputValue,
} from '../dist/slider/data.js';
import { createSliderDragFoundation } from '../dist/slider/drag.js';
import { createSliderFoundation } from '../dist/slider/foundation.js';

function setup(patch: Partial<SliderOptions> = {}, initial: SliderValue = 20) {
  const options: SliderOptions = {
    range: false,
    min: 0,
    max: 100,
    step: 10,
    direction: 'horizontal',
    ...patch,
  };
  let [start, end] = getSliderInitialValues(options.modelValue, initial);
  let disabled = false;
  let measurements = 0;
  let onUpdate: (() => void) | undefined;
  const events: [string, SliderValue?][] = [];
  const foundation = createSliderFoundation({
    get options() {
      return options;
    },
    get start() {
      return start;
    },
    get end() {
      return end;
    },
    get display() {
      return foundation.getValue();
    },
    rect: { left: 10, top: 20, width: 200, height: 400 },
    isDisabled: () => disabled,
    setStart: (value) => {
      start = value;
    },
    setEnd: (value) => {
      end = value;
    },
    measure: () => {
      measurements++;
    },
    onUpdate: (value) => {
      events.push(['update', value]);
      onUpdate?.();
    },
    onChange: (value) => events.push(['change', value]),
    onFormChange: () => events.push(['form']),
  });
  const key = (which: 'start' | 'end', key: string) => {
    let prevented = false;
    foundation.keydown(which, {
      key,
      preventDefault: () => {
        prevented = true;
      },
    });
    return prevented;
  };
  return {
    options,
    foundation,
    events,
    key,
    setDisabled: (value: boolean) => {
      disabled = value;
    },
    setOnUpdate: (callback: () => void) => {
      onUpdate = callback;
    },
    measurements: () => measurements,
  };
}

test('Slider initial and displayed values preserve controlled tuple identity and scalar/array mode rules', () => {
  assert.deepEqual(getSliderInitialValues(undefined, 0), [0, 0]);
  assert.deepEqual(getSliderInitialValues([70, 20], 0), [70, 20]);
  const state = setup({ min: -100 }, -50);
  assert.deepEqual(state.foundation.getValue(), [-100, -50]);
  state.options.modelValue = [25, 75];
  assert.deepEqual(state.foundation.getValue(), [-100, 25]);
  state.options.range = true;
  assert.equal(state.foundation.getValue(), state.options.modelValue);
  state.foundation.syncModel(undefined);
  state.options.modelValue = undefined;
  assert.deepEqual(state.foundation.getValue(), [0, -100]);
});

test('Slider coordinates preserve negative minimum, vertical inversion, decimal steps and edge clamping', () => {
  const rect = { left: 10, top: 20, width: 200, height: 400 };
  const horizontal = { min: -100, max: 100, step: 10, direction: 'horizontal' as const };
  assert.equal(getSliderValueByCoords(60, 0, rect, horizontal), -50);
  assert.equal(getSliderValueByCoords(-10, 0, rect, horizontal), -100);
  assert.equal(getSliderValueByCoords(999, 0, rect, { ...horizontal, min: 0, max: 95 }), 95);
  assert.equal(getSliderValueByCoords(0, 120, rect, { ...horizontal, direction: 'vertical' }), 50);
  assert.equal(
    getSliderValueByCoords(110, 0, rect, { ...horizontal, min: 0.1, max: 1.1, step: 0.2 }),
    0.7,
  );
  assert.equal(getSliderValueByCoords(1, 2, undefined, horizontal), 0);
});

test('Slider styles, marks and ticks retain offsets, source ordering and interior/active boundaries', () => {
  assert.equal(getOffsetPercent(-200, [-100, 100]), '0%');
  assert.equal(getOffsetPercent(200, [-100, 100]), '100%');
  assert.deepEqual(getPositionStyle('25%', 'vertical'), { bottom: '25%' });
  assert.deepEqual(getSliderBarStyle([50, -50], { min: -100, max: 100, direction: 'horizontal' }), {
    left: '25%',
    right: '25%',
  });
  assert.deepEqual(getSliderTicks([0.2, 0.4], 0, 0.5, 0.1), [
    { key: 0.1, isActive: false },
    { key: 0.2, isActive: true },
    { key: 0.30000000000000004, isActive: true },
    { key: 0.4, isActive: true },
  ]);
  assert.deepEqual(getSliderMarks({ 50: 'mid', '-50': 'negative' }, [-100, 0]), [
    { key: 50, content: 'mid', isActive: false },
    { key: -50, content: 'negative', isActive: true },
  ]);
});

test('Slider input conversion preserves nil and decimal string behavior', () => {
  assert.equal(getSliderInputValue(undefined), undefined);
  assert.equal(getSliderInputValue(null), undefined);
  assert.equal(getSliderInputValue('1.25'), 1.25);
  assert.equal(getSliderInputValue(''), 0);
});

test('Slider rejected controlled updates always step from the displayed value', () => {
  const state = setup({ modelValue: 20 });
  state.key('end', 'ArrowRight');
  state.key('end', 'ArrowRight');
  assert.deepEqual(
    state.events.filter(([name]) => name === 'change'),
    [
      ['change', 30],
      ['change', 30],
    ],
  );
  assert.deepEqual(state.foundation.getValue(), [0, 20]);
  const range = setup({ range: true, modelValue: [20, 60] });
  range.key('start', 'ArrowRight');
  range.key('end', 'ArrowRight');
  assert.deepEqual(
    range.events.filter(([name]) => name === 'change'),
    [
      ['change', [30, 60]],
      ['change', [20, 70]],
    ],
  );
});

test('Slider keyboard applies exact decimal limits, ignores unsupported keys and blocks disabled input', () => {
  const state = setup({ range: true, min: 0, max: 1, step: 0.2 }, [0, 0.3]);
  assert.equal(state.key('start', 'End'), true);
  assert.deepEqual(state.foundation.getValue(), [0.1, 0.3]);
  assert.equal(state.key('end', 'PageDown'), false);
  state.setDisabled(true);
  assert.equal(state.key('end', 'ArrowRight'), false);
  assert.equal(state.events.length, 3);
});

test('Slider range input sorts crossings while coordinate dragging preserves crossing payloads', () => {
  const state = setup({ range: true }, [20, 60]);
  state.foundation.startChange(80);
  assert.deepEqual(state.foundation.getValue(), [60, 80]);
  state.foundation.endChange(10);
  assert.deepEqual(state.foundation.getValue(), [10, 60]);
  state.foundation.startMoving(190, 0);
  assert.deepEqual(state.foundation.getValue(), [90, 60]);
  state.foundation.endChange(undefined);
  assert.deepEqual(state.foundation.getValue(), [0, 90]);
});

test('Slider track clicks measure fresh geometry and choose the nearest handle, with ties selecting the end', () => {
  const state = setup({ range: true }, [20, 80]);
  state.foundation.click({ clientX: 70, clientY: 0 });
  assert.deepEqual(state.foundation.getValue(), [30, 80]);
  state.foundation.click({ clientX: 130, clientY: 0 });
  assert.deepEqual(state.foundation.getValue(), [30, 60]);
  state.setDisabled(true);
  state.foundation.click({ clientX: 10, clientY: 0 });
  assert.equal(state.measurements(), 2);
  const tie = setup({ range: true }, [20, 80]);
  tie.foundation.click({ clientX: 110, clientY: 0 });
  assert.deepEqual(tie.foundation.getValue(), [20, 50]);
});

test('Slider range publication preserves fresh arrays and re-reads local values after synchronous listeners', () => {
  const state = setup({ range: true }, [20, 60]);
  state.setOnUpdate(() => state.foundation.syncModel([77, 88]));
  state.foundation.endChange(70);
  assert.deepEqual(state.events, [['update', [20, 70]], ['change', [77, 88]], ['form']]);
  assert.notEqual(state.events[0][1], state.events[1][1]);
});

test('Slider drag listens for mouse/touch input and cleans up on cancellation, disable and disposal', () => {
  const target = new EventTarget();
  let disabled = false;
  const events: unknown[][] = [];
  const drag = createSliderDragFoundation({
    getTarget: () => target,
    isDisabled: () => disabled,
    setDragging: (value) => events.push(['drag', value]),
    onStart: () => events.push(['start']),
    onMove: (x, y) => events.push(['move', x, y]),
    onEnd: () => events.push(['end']),
  });
  const mouse = Object.assign(new Event('mousemove'), { clientX: 10, clientY: 20 });
  drag.start({ preventDefault: () => events.push(['prevent']) });
  target.dispatchEvent(mouse);
  target.dispatchEvent(new Event('mouseup'));
  target.dispatchEvent(mouse);
  assert.deepEqual(events, [
    ['prevent'],
    ['drag', true],
    ['start'],
    ['move', 10, 20],
    ['drag', false],
    ['end'],
  ]);
  events.length = 0;
  drag.start({ preventDefault() {} });
  target.dispatchEvent(
    Object.assign(new Event('touchmove'), { touches: [{ clientX: 30, clientY: 40 }] }),
  );
  target.dispatchEvent(new Event('touchcancel'));
  target.dispatchEvent(mouse);
  assert.deepEqual(events, [['drag', true], ['start'], ['move', 30, 40], ['drag', false], ['end']]);
  events.length = 0;
  drag.start({ preventDefault() {} });
  drag.cleanup();
  target.dispatchEvent(mouse);
  disabled = true;
  drag.start({
    preventDefault() {
      throw new Error('disabled start');
    },
  });
  assert.deepEqual(events, [['drag', true], ['start'], ['drag', false]]);
});
