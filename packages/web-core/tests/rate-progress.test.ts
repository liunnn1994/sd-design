import assert from 'node:assert/strict';
import { test } from 'node:test';

import type {
  ProgressOptions,
  ProgressCircleOptions,
  ProgressLineOptions,
  ProgressStepsOptions,
} from '../src/progress/foundation.ts';
import type { RateOptions } from '../src/rate/foundation.ts';

import {
  createProgressFoundation,
  createProgressLineFoundation,
  createProgressCircleFoundation,
  createProgressStepsFoundation,
  getProgressBackground,
  getProgressPercent,
  getProgressText,
} from '../dist/progress/foundation.js';
import { createRateFoundation } from '../dist/rate/foundation.js';

function setup(patch: Partial<RateOptions> = {}, initial = 0) {
  const options: RateOptions = {
    count: 5,
    grading: false,
    allowHalf: false,
    readonly: false,
    ...patch,
  };
  let inner = initial;
  let hover = 0;
  let animation = false;
  let disabled = false;
  let allowClear = false;
  let onUpdate: (() => void) | undefined;
  const events: [event: string, value?: number | boolean][] = [];
  const foundation = createRateFoundation({
    get options() {
      return options;
    },
    get inner() {
      return inner;
    },
    get value() {
      return foundation.getValue();
    },
    get display() {
      return foundation.getDisplay();
    },
    get indices() {
      return foundation.getIndices();
    },
    get colors() {
      return foundation.getColors();
    },
    get hover() {
      return hover;
    },
    get animation() {
      return animation;
    },
    isDisabled: () => disabled || !!options.readonly,
    isFormDisabled: () => disabled,
    allowClear: () => allowClear,
    setInner: (value) => {
      inner = value;
      events.push(['inner', value]);
    },
    setHover: (value) => {
      hover = value;
      events.push(['hover', value]);
    },
    setAnimation: (value) => {
      animation = value;
      events.push(['animation', value]);
    },
    onUpdate: (value) => {
      events.push(['update', value]);
      onUpdate?.();
    },
    onChange: (value) => events.push(['change', value]),
    onHover: (value) => events.push(['hoverChange', value]),
    onFormChange: () => events.push(['form']),
  });
  const key = (key: string) => {
    let prevented = false;
    foundation.keydown({
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
    getAnimation: () => animation,
    setDisabled: (value: boolean) => {
      disabled = value;
    },
    setAllowClear: (value: boolean) => {
      allowClear = value;
    },
    setOnUpdate: (callback: () => void) => {
      onUpdate = callback;
    },
  };
}

test('Rate rounding and hover display preserve raw controlled values and release resets', () => {
  const state = setup({ modelValue: 2.26, allowHalf: true });
  assert.equal(state.foundation.getDisplay(), 2.5);
  state.foundation.mouseEnter(3, true);
  assert.equal(state.foundation.getDisplay(), 3.5);
  state.foundation.resetHover();
  assert.equal(state.foundation.getValue(), 2.26);
  state.options.modelValue = undefined;
  state.foundation.syncModel(undefined);
  assert.equal(state.foundation.getValue(), 0);
});

test('Rate click publishes animation/local/model/change/form in order and keeps the chosen payload after reentry', () => {
  const state = setup({ modelValue: 2 });
  state.setOnUpdate(() => {
    state.options.modelValue = 5;
  });
  state.foundation.click(2, false);
  assert.deepEqual(state.events, [
    ['animation', true],
    ['inner', 3],
    ['update', 3],
    ['change', 3],
    ['form'],
  ]);
  assert.equal(state.foundation.getValue(), 5);
});

test('Rate repeated clicks only clear when allowed, with animation lifetime preserved', () => {
  const state = setup({}, 3);
  state.foundation.click(2, false);
  assert.deepEqual(state.events, [['animation', true]]);
  state.foundation.animationEnd(0);
  assert.equal(state.getAnimation(), true);
  state.foundation.animationEnd(1);
  assert.equal(state.getAnimation(), false);
  state.events.length = 0;
  state.setAllowClear(true);
  state.foundation.click(2, false);
  assert.deepEqual(state.events, [
    ['animation', true],
    ['inner', 0],
    ['update', 0],
    ['change', 0],
    ['form'],
  ]);
});

test('Rate hover deduplicates and disabled/readonly routing preserves tooltip behavior', () => {
  const state = setup();
  state.foundation.mouseEnter(3, false);
  state.foundation.mouseEnter(3, false);
  state.foundation.syncDisabled(true);
  state.foundation.resetHover();
  assert.deepEqual(state.events, [
    ['hover', 4],
    ['hoverChange', 4],
    ['hover', 0],
    ['hoverChange', 0],
  ]);
  assert.equal(state.foundation.getInteractionMode(), 'edit');
  state.options.readonly = 'readonly text';
  assert.equal(state.foundation.getInteractionMode(), 'readonly-tip');
  state.setDisabled(true);
  assert.equal(state.foundation.getInteractionMode(), 'none');
});

test('Rate keyboard half steps clamp to the effective grading count and never clear a boundary', () => {
  const state = setup({ count: 10, grading: true, allowHalf: true }, 4.5);
  assert.equal(state.key('ArrowRight'), true);
  assert.equal(state.foundation.getValue(), 5);
  state.setAllowClear(true);
  state.key('End');
  assert.equal(state.foundation.getValue(), 5);
  assert.equal(state.getAnimation(), false);
  assert.equal(state.key('PageDown'), false);
  state.setDisabled(true);
  assert.equal(state.key('Home'), false);
  assert.equal(state.events.length, 4);
});

test('Rate threshold colors apply per character and half selection uses the current character color', () => {
  const state = setup({
    allowHalf: true,
    modelValue: 2.5,
    color: { 2: 'red', 4: 'gold', 5: 'green' },
  });
  assert.deepEqual(state.foundation.getColors(), ['red', 'red', 'gold', 'gold', 'green']);
  assert.deepEqual(state.foundation.getCharacterColor(2, true), { color: 'gold' });
  assert.equal(state.foundation.getCharacterColor(2, false), undefined);
  assert.deepEqual(state.foundation.getCharacterColor(1, false), { color: 'red' });
  state.options.color = 'blue';
  assert.deepEqual(state.foundation.getColors(), Array(5).fill('blue'));
});

test('Rate grading faces and half-star ARIA positions retain inactive branches and raw value checks', () => {
  const state = setup({ grading: true, modelValue: 2 });
  assert.equal(state.foundation.getGradingFace(0), 'frown');
  assert.equal(state.foundation.getGradingFace(3), 'inactive-meh');
  state.options.modelValue = 3;
  assert.equal(state.foundation.getGradingFace(0), 'meh');
  state.options.modelValue = 4;
  assert.equal(state.foundation.getGradingFace(0), 'smile');
  assert.deepEqual(state.foundation.getInteractionProps(0, true), {});
  state.options.allowHalf = true;
  state.options.modelValue = 2.5;
  assert.deepEqual(state.foundation.getAriaProps(2, true), {
    'role': 'radio',
    'aria-checked': true,
    'aria-setsize': 10,
    'aria-posinset': 5,
  });
});

test('Progress mode/status and mini-line stroke rules preserve explicit zero and numeric width handling', () => {
  const options: ProgressOptions = {
    type: 'line',
    steps: 0,
    percent: 1,
    strokeWidth: 0,
    width: '64',
  };
  const model = createProgressFoundation(options);
  assert.equal(model.getStatus(), 'success');
  assert.equal(model.getCircleStrokeWidth(), 4);
  assert.equal(model.getCircleWidth(), undefined);
  options.type = 'circle';
  options.status = 'warning';
  options.width = 0;
  assert.equal(model.getStatus(), 'warning');
  assert.equal(model.getCircleStrokeWidth(), 0);
  assert.equal(model.getCircleWidth(), 0);
  options.steps = 3;
  assert.equal(model.getType(), 'steps');
});

test('Progress line keeps unbounded widths, exact displayed percentages and gradient stop insertion order', () => {
  const options: ProgressLineOptions = {
    size: 'small',
    percent: 1.2,
    width: 0,
    strokeWidth: 0,
    color: { '0%': 'red', '100%': 'blue' },
  };
  const model = createProgressLineFoundation(options);
  assert.deepEqual(model.getStyle(), { width: '0px', height: '0px', backgroundColor: undefined });
  assert.deepEqual(model.getBarStyle(), {
    width: '120%',
    backgroundImage: 'linear-gradient(to right, red 0%,blue 100%)',
  });
  assert.equal(getProgressPercent(0.29), 29);
  assert.equal(getProgressText(0.29), '29%');
  assert.equal(getProgressBackground(''), undefined);
  options.percent = -0.2;
  assert.equal(model.getBarStyle().width, '-20%');
});

test('Progress circle geometry preserves mini and normal width/stroke defaults and explicit zeros', () => {
  const options: ProgressCircleOptions = { size: 'mini', percent: 0.5 };
  const model = createProgressCircleFoundation(options, () => 'gradient');
  assert.equal(model.getWidth(), 16);
  assert.equal(model.getStrokeWidth(), 8);
  assert.equal(model.getPathStrokeWidth(), 8);
  assert.equal(model.getRadius(), 4);
  assert.deepEqual(model.getIconStyle(), { fontSize: 14, color: undefined });
  options.size = 'medium';
  assert.equal(model.getWidth(), 64);
  assert.equal(model.getRadius(), 30);
  assert.equal(model.getPathStrokeWidth(), 2);
  options.width = 0;
  options.strokeWidth = 0;
  options.pathStrokeWidth = 0;
  assert.equal(model.getCenter(), 0);
  assert.equal(model.getStrokeWidth(), 0);
  assert.equal(model.getPathStrokeWidth(), 0);
});

test('Progress circle gradients stringify stops and retain upper-only dash-offset clamping', () => {
  let ids = 0;
  const options: ProgressCircleOptions = { size: 'medium', percent: 1.2, color: 'red' };
  const model = createProgressCircleFoundation(options, () => {
    ids++;
    return 'circle-id';
  });
  assert.equal(model.getCircleStyle().stroke, 'red');
  assert.equal(model.getCircleStyle().strokeDashoffset, 0);
  assert.equal(ids, 0);
  options.color = { '0%': 0, '100%': 'blue' };
  assert.deepEqual(model.getGradientStops(), [
    ['0%', '0'],
    ['100%', 'blue'],
  ]);
  options.percent = -0.1;
  const style = model.getCircleStyle();
  assert.equal(style.stroke, 'url(#circle-id)');
  assert.equal(style.strokeDashoffset, 1.1 * style.strokeDasharray);
});

test('Progress steps use strict thresholds, string-only active colors and original size defaults', () => {
  const options: ProgressStepsOptions = {
    steps: 4,
    percent: 0.25,
    size: 'small',
    color: { '0%': 'red' },
    trackColor: 'gray',
  };
  const model = createProgressStepsFoundation(options);
  assert.deepEqual(model.getSteps(), [true, false, false, false]);
  assert.deepEqual(model.getStepStyle(true), { backgroundColor: undefined });
  assert.deepEqual(model.getStepStyle(false), { backgroundColor: 'gray' });
  assert.equal(model.getStrokeWidth(), 8);
  options.percent = 0.26;
  options.strokeWidth = 0;
  assert.deepEqual(model.getSteps(), [true, true, false, false]);
  assert.equal(model.getStrokeWidth(), 0);
  options.percent = 0;
  assert.deepEqual(model.getSteps(), [false, false, false, false]);
});
