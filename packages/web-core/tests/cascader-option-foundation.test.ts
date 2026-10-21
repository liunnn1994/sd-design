import assert from 'node:assert/strict';
import test from 'node:test';

import type {
  CascaderOptionContext,
  CascaderOptionCheckedStatus,
} from '../dist/cascader/option.js';
import type { CascaderOptionInfo } from '../dist/cascader/types.js';

import { createCascaderOptionFoundation } from '../dist/cascader/option.js';

function node(key = 'root', isLeaf = true): CascaderOptionInfo {
  const raw = { value: key, label: key };
  const option: CascaderOptionInfo = {
    raw,
    key,
    valueKey: key,
    level: 0,
    index: 0,
    value: key,
    label: key,
    disabled: false,
    selectionDisabled: false,
    isLeaf,
    path: [],
    pathValue: [key],
  };
  option.path = [option];
  return option;
}
function subject() {
  const trace: unknown[] = [];
  const state = {
    option: node(),
    checkStrictly: false,
    multiple: false,
    checkedStatus: { checked: false, indeterminate: false } as CascaderOptionCheckedStatus,
  };
  const context: Partial<CascaderOptionContext> = {
    expandTrigger: 'click',
    loadOption(option) {
      assert.equal(this, context);
      trace.push(['load', option]);
    },
    setSelectedPath(key) {
      assert.equal(this, context);
      trace.push(['path', key]);
    },
    setActiveKey(...keys) {
      assert.equal(this, context);
      trace.push(['active', ...keys]);
    },
    onClickOption(...args) {
      assert.equal(this, context);
      trace.push(['select', ...args]);
    },
  };
  const api = createCascaderOptionFoundation(state, context);
  const event = {
    stopPropagation() {
      assert.equal(this, event);
      trace.push('stop');
    },
  } as unknown as Event;
  return { state, context, api, trace, event };
}

for (const disabled of [false, true])
  for (const expandTrigger of ['click', 'hover', undefined] as const)
    for (const multiple of [false, true])
      for (const isLeaf of [false, true]) {
        test(`cascader click preserves guards and load/path/select ordering: ${disabled}/${expandTrigger}/${multiple}/${isLeaf}`, () => {
          const { state, context, api, trace } = subject();
          state.option.disabled = disabled;
          state.option.isLeaf = isLeaf;
          state.multiple = multiple;
          if (expandTrigger === undefined) delete context.expandTrigger;
          else context.expandTrigger = expandTrigger;
          api.handleClick();
          const expected: unknown[] = [];
          if (!disabled) {
            if (expandTrigger !== 'hover')
              expected.push(['load', state.option], ['path', state.option.key]);
            if (isLeaf && !multiple) expected.push(['select', state.option]);
          }
          assert.deepEqual(trace, expected);
        });
      }

test('cascader factory and missing loading callback do not read option state', () => {
  const api = createCascaderOptionFoundation(
    {
      get option(): CascaderOptionInfo {
        assert.fail('option');
      },
      checkStrictly: true,
      multiple: false,
      get checkedStatus(): CascaderOptionCheckedStatus {
        assert.fail('checked');
      },
    },
    {},
  );
  assert.equal(api.getIsLoading(), false);
  assert.deepEqual(api.getCheckedStatus(), { checked: undefined, indeterminate: false });
  api.handleCheckboxChange(null, { stopPropagation() {} } as Event);
  api.handleRadioChange(null, { stopPropagation() {} } as Event);
});

test('cascader loading callback retains receiver and live option identity', () => {
  const { state, context, api } = subject();
  const seen: CascaderOptionInfo[] = [];
  context.isLoading = function (option) {
    assert.equal(this, context);
    seen.push(option);
    return option.key === 'later';
  };
  assert.equal(api.getIsLoading(), false);
  const original = state.option;
  state.option = node('later');
  assert.equal(api.getIsLoading(), true);
  assert.deepEqual(seen, [original, state.option]);
});

test('cascader strict and hierarchical checked states retain missing-map and partial-parent semantics', () => {
  const { state, context, api } = subject();
  state.checkStrictly = true;
  assert.deepEqual(api.getCheckedStatus(), { checked: undefined, indeterminate: false });
  context.valueMap = new Map();
  assert.deepEqual(api.getCheckedStatus(), { checked: false, indeterminate: false });
  context.valueMap.set('root', 'root');
  assert.deepEqual(api.getCheckedStatus(), { checked: true, indeterminate: false });
  state.checkStrictly = false;
  state.option.isLeaf = false;
  state.option.totalLeafOptions = 2;
  context.valueMap = new Map([['root-a', 'a']]);
  assert.deepEqual(api.getCheckedStatus(), { checked: false, indeterminate: true });
  context.valueMap.set('root-b', 'b');
  assert.deepEqual(api.getCheckedStatus(), { checked: true, indeterminate: false });
});

for (const formatted of ['', 'Custom', null, undefined]) {
  test(`cascader formatted path uses nullish fallback and raw identity: ${String(formatted)}`, () => {
    const { state, context, api } = subject();
    const parent = node('parent', false);
    state.option.path = [parent, state.option];
    context.separator = ' > ';
    context.formatLabel = function (options) {
      assert.equal(this, context);
      assert.equal(options[0], parent.raw);
      assert.equal(options[1], state.option.raw);
      return formatted as unknown as string;
    };
    assert.equal(api.getPathOptionLabel(), formatted ?? 'parent > root');
    delete context.formatLabel;
    delete context.separator;
    assert.equal(api.getPathOptionLabel(), 'parent / root');
  });
}

test('cascader successful formatting skips fallback separator reads', () => {
  const { state } = subject();
  const api = createCascaderOptionFoundation(state, {
    formatLabel: () => '',
    get separator(): string {
      assert.fail('separator');
    },
  });
  assert.equal(api.getPathOptionLabel(), '');
});

test('cascader mouseenter activates before reading hover policy and loading path', () => {
  const { state, context, api, trace } = subject();
  context.setActiveKey = function (key) {
    assert.equal(this, context);
    trace.push(['active', key]);
    context.expandTrigger = 'hover';
  };
  api.handleMouseenter();
  assert.deepEqual(trace, [
    ['active', 'root'],
    ['load', state.option],
    ['path', 'root'],
  ]);
  trace.length = 0;
  state.option.disabled = true;
  api.handleMouseenter();
  api.handleMouseleave();
  assert.deepEqual(trace, []);
});

test('cascader mouseleave calls active reset with no argument', () => {
  const { api, trace } = subject();
  api.handleMouseleave();
  assert.deepEqual(trace, [['active']]);
});

test('cascader click reads current option and flags after load callbacks without an added disabled guard', () => {
  const { state, context, api, trace } = subject();
  const original = state.option;
  const replacement = node('new');
  replacement.disabled = true;
  context.loadOption = function (option) {
    assert.equal(this, context);
    trace.push(['load', option]);
    state.option = replacement;
  };
  api.handleClick();
  assert.deepEqual(trace, [
    ['load', original],
    ['path', 'new'],
    ['select', replacement],
  ]);
});

test('cascader checkbox stops first, loads then changes path before re-reading checked and option', () => {
  const { state, context, api, trace, event } = subject();
  const original = state.option;
  const replacement = node('new');
  context.loadOption = (option) => {
    trace.push(['load', option]);
    state.option = replacement;
  };
  context.setSelectedPath = (key) => {
    trace.push(['path', key]);
    state.checkedStatus = { checked: true, indeterminate: false };
  };
  api.handleCheckboxChange('ignored', event);
  assert.deepEqual(trace, [
    'stop',
    ['load', original],
    ['path', 'new'],
    ['select', replacement, false],
  ]);
});

test('cascader checkbox and radio preserve handler behavior even when a direct caller bypasses the disabled native control', () => {
  const { state, api, trace, event } = subject();
  state.option.disabled = true;
  state.option.selectionDisabled = true;
  api.handleCheckboxChange(null, event);
  assert.deepEqual(trace, [
    'stop',
    ['load', state.option],
    ['path', 'root'],
    ['select', state.option, true],
  ]);
  trace.length = 0;
  api.handleRadioChange(null, event);
  assert.deepEqual(trace, [
    'stop',
    ['load', state.option],
    ['path', 'root'],
    ['select', state.option, true],
  ]);
});

test('cascader radio does not read checked status', () => {
  const { state, context, trace, event } = subject();
  const api = createCascaderOptionFoundation(
    {
      ...state,
      get checkedStatus(): CascaderOptionCheckedStatus {
        assert.fail('checked');
      },
    },
    context,
  );
  api.handleRadioChange(false, event);
  assert.deepEqual(trace, [
    'stop',
    ['load', state.option],
    ['path', 'root'],
    ['select', state.option, true],
  ]);
});

test('cascader stopPropagation failure prevents loading and selection', () => {
  const { api, trace } = subject();
  const event = {
    stopPropagation() {
      throw new Error('stop');
    },
  } as unknown as Event;
  assert.throws(() => api.handleCheckboxChange(null, event), /stop/);
  assert.deepEqual(trace, []);
  assert.throws(() => api.handleRadioChange(null, event), /stop/);
  assert.deepEqual(trace, []);
});

test('cascader load failure stops path and selection; path failure stops checked reads', () => {
  const first = subject();
  first.context.loadOption = () => {
    first.trace.push('load');
    throw new Error('load');
  };
  assert.throws(() => first.api.handleCheckboxChange(null, first.event), /load/);
  assert.deepEqual(first.trace, ['stop', 'load']);
  const second = subject();
  second.context.setSelectedPath = () => {
    second.trace.push('path');
    throw new Error('path');
  };
  const api = createCascaderOptionFoundation(
    {
      ...second.state,
      get checkedStatus(): CascaderOptionCheckedStatus {
        assert.fail('checked');
      },
    },
    second.context,
  );
  assert.throws(() => api.handleCheckboxChange(null, second.event), /path/);
  assert.deepEqual(second.trace, ['stop', ['load', second.state.option], 'path']);
});

test('cascader optional callbacks remain independent and preserve empty format and loading defaults', () => {
  const { state, trace } = subject();
  const context: Partial<CascaderOptionContext> = { setSelectedPath: (key) => trace.push(key) };
  const api = createCascaderOptionFoundation(state, context);
  api.handleClick();
  assert.deepEqual(trace, ['root']);
  assert.equal(api.getIsLoading(), false);
  assert.equal(api.getPathOptionLabel(), 'root');
});
