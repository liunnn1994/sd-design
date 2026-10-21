import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getAllowableFlexValue,
  hasBreakpointValue,
  getGridColumnClassNames,
  getGridColumnPadding,
  type GridColumnProps,
} from '../dist/grid/column.js';
import { getSize, getSpaceAlign, getSpaceStyle, type SpaceSize } from '../dist/space/foundation.js';

for (const value of [
  0,
  -0,
  1,
  -1,
  1.5,
  Infinity,
  -Infinity,
  'initial',
  'auto',
  'none',
  '0',
  '001',
  '123',
]) {
  test(`Grid flex retains accepted ${String(value)}`, () =>
    assert.equal(getAllowableFlexValue(value), value));
}
for (const value of ['0px', '12px', '3em', '4rem', '50%']) {
  test(`Grid flex expands integer length ${value}`, () =>
    assert.equal(getAllowableFlexValue(value), `0 0 ${value}`));
}
for (const value of [
  undefined,
  NaN,
  '',
  ' 1',
  '1 ',
  '-1',
  '1.5',
  '-2px',
  '1.5rem',
  '1vw',
  '1PX',
  'inherit',
  '1 0 auto',
]) {
  test(`Grid flex rejects ${String(value)}`, () =>
    assert.equal(getAllowableFlexValue(value), undefined));
}
test('Grid shared predicates keep boxed values and reject nullish breakpoints only', () => {
  const boxed = Object(2) as number;
  assert.equal(getAllowableFlexValue(boxed), boxed);
  assert.equal(getAllowableFlexValue(Object('12px') as string), '0 0 12px');
  assert.equal(getAllowableFlexValue(Object('auto') as string), undefined);
  for (const value of [0, false, '', NaN, {}, []]) assert.equal(hasBreakpointValue(value), true);
  for (const value of [undefined, null]) assert.equal(hasBreakpointValue(value), false);
});
test('Grid classes retain raw truthy values, zero responsive entries and key order', () => {
  const props: GridColumnProps = {
    span: 12,
    offset: 0,
    order: 0,
    xs: 0,
    sm: { span: 0, offset: 0, order: 0 },
    md: { span: 6 },
    lg: undefined,
  };
  assert.deepEqual(getGridColumnClassNames('custom', props, {}), {
    'custom': true,
    'custom-order-0': 0,
    'custom-12': false,
    'custom-offset-0': 0,
    'custom-xs-0': true,
    'custom-sm-0': 0,
    'custom-sm-offset-0': true,
    'custom-sm-order-0': true,
    'custom-md-6': 6,
    'custom-md-offset-undefined': false,
    'custom-md-order-undefined': false,
  });
  assert.equal(getGridColumnClassNames('c', { span: 12 }, {})['c-12'], true);
  assert.equal(
    getGridColumnClassNames('c', { span: 12, xs: null as unknown as number }, {})['c-12'],
    true,
  );
  assert.equal(getGridColumnClassNames('c', { span: 12 }, { div: true })['c'], false);
});
test('Grid class projection reads context then all props before breakpoint getters', () => {
  const calls: string[] = [],
    props = {
      span: 12,
      offset: 1,
      order: 2,
      xs: 0,
      sm: undefined,
      md: undefined,
      lg: undefined,
      xl: undefined,
      xxl: undefined,
    };
  getGridColumnClassNames(
    'c',
    new Proxy(props, {
      get(t, key: keyof typeof props) {
        calls.push(key);
        return t[key];
      },
    }),
    {
      get div() {
        calls.push('div');
        return false;
      },
    },
  );
  assert.deepEqual(calls, ['div', 'span', 'offset', 'order', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl']);
});
test('Grid responsive object fields retain repeat reads and presence semantics', () => {
  const calls: string[] = [],
    value = {
      get span() {
        calls.push('span');
        return 0;
      },
      get offset() {
        calls.push('offset');
        return 0;
      },
      get order() {
        calls.push('order');
        return 0;
      },
    };
  const result = getGridColumnClassNames('c', { span: 24, xs: value }, {});
  assert.equal(result['c-xs-0'], 0);
  assert.equal(result['c-xs-offset-0'], true);
  assert.deepEqual(calls, ['span', 'span', 'offset', 'offset', 'order', 'order']);
});
test('Grid gutter computes half padding without coercing absent/zero/NaN into styles', () => {
  assert.deepEqual(getGridColumnPadding({ gutter: [16, 8] }), {
    paddingLeft: '8px',
    paddingRight: '8px',
    paddingTop: '4px',
    paddingBottom: '4px',
  });
  assert.deepEqual(getGridColumnPadding({ gutter: [-8, 3] }), {
    paddingLeft: '-4px',
    paddingRight: '-4px',
    paddingTop: '1.5px',
    paddingBottom: '1.5px',
  });
  assert.deepEqual(getGridColumnPadding({ gutter: [0, NaN] }), {});
  assert.deepEqual(getGridColumnPadding({ gutter: [16, 8], div: true }), {});
  assert.deepEqual(getGridColumnPadding({}), {});
});
test('Grid gutter preserves destructuring and short-circuited array index reads', () => {
  const calls: string[] = [],
    gutter = new Proxy([8, 0] as [number, number], {
      get(t, key, receiver) {
        calls.push(String(key));
        return Reflect.get(t, key, receiver);
      },
    });
  getGridColumnPadding({
    get gutter() {
      calls.push('gutter');
      return gutter;
    },
    get div() {
      calls.push('div');
      return false;
    },
  });
  assert.deepEqual(calls, ['gutter', 'div', '0', '0', '1']);
  calls.length = 0;
  getGridColumnPadding({ gutter, div: true });
  assert.deepEqual(calls, []);
});
for (const [value, expected] of [
  ['mini', 4],
  ['small', 8],
  ['medium', 16],
  ['large', 24],
  [0, 0],
  [-2, -2],
  [2.5, 2.5],
  [Infinity, Infinity],
  [NaN, 8],
  ['unknown', 8],
  [undefined, 8],
] as const) {
  test(`Space size mapping ${String(value)}`, () =>
    assert.equal(getSize(value as SpaceSize), expected));
}
test('Space keeps boxed numeric identity and scalar getter evaluation order', () => {
  const value = Object(4) as number;
  assert.equal(getSize(value), value);
  const values: SpaceSize[] = ['mini', 'medium', 'large'];
  let calls = 0;
  assert.deepEqual(
    getSpaceStyle({
      get size() {
        return values[calls++]!;
      },
    }),
    { columnGap: '16px', rowGap: '24px' },
  );
  assert.equal(calls, 3);
  const tuple: [SpaceSize, SpaceSize] = ['mini', 'large'];
  calls = 0;
  assert.deepEqual(
    getSpaceStyle({
      get size() {
        calls++;
        return tuple;
      },
    }),
    { columnGap: '4px', rowGap: '24px' },
  );
  assert.equal(calls, 2);
});
test('Space gaps preserve short/sparse tuples and array map overrides', () => {
  assert.deepEqual(getSpaceStyle({ size: [0, -2] }), { columnGap: '0px', rowGap: '-2px' });
  assert.deepEqual(getSpaceStyle({ size: ['large'] as unknown as [SpaceSize, SpaceSize] }), {
    columnGap: '24px',
    rowGap: 'undefinedpx',
  });
  const sparse = new Array<SpaceSize>(2);
  sparse[1] = 'mini';
  assert.deepEqual(getSpaceStyle({ size: sparse as [SpaceSize, SpaceSize] }), {
    columnGap: 'undefinedpx',
    rowGap: '4px',
  });
  let calls = 0;
  const size: ['mini', 'small'] = ['mini', 'small'];
  size.map = ((fn: (value: SpaceSize) => number) => {
    calls++;
    assert.equal(fn('large'), 24);
    return [3, 7];
  }) as typeof size.map;
  assert.deepEqual(getSpaceStyle({ size }), { columnGap: '3px', rowGap: '7px' });
  assert.equal(calls, 1);
});
test('Space explicit alignment skips direction while nullish fallback reads it', () => {
  let reads = 0;
  const state = {
    align: 'baseline' as const,
    get direction() {
      reads++;
      return 'horizontal' as const;
    },
  };
  assert.equal(getSpaceAlign(state), 'baseline');
  assert.equal(reads, 0);
  assert.equal(getSpaceAlign({ direction: 'horizontal' }), 'center');
  assert.equal(getSpaceAlign({ direction: 'vertical' }), '');
});
