import assert from 'node:assert/strict';
import test from 'node:test';

import { dayjs } from '../dist/_utils/date.js';
import {
  createDatePanelHeaderLabels,
  type DatePanelHeaderLabelState,
} from '../dist/date-picker/header.js';

for (const mode of ['date', 'week', 'month', 'quarter', 'year'] as const) {
  test(`Date header labels preserve ${mode} mode rules`, () => {
    const calls: string[] = [],
      labels = createDatePanelHeaderLabels({ mode, value: dayjs('2025-07-08') }, (key) => {
        calls.push(key);
        return key;
      });
    assert.equal(labels.getYear(), mode === 'year' ? '' : '2025');
    assert.equal(labels.getMonth(), mode === 'date' || mode === 'week' ? '07' : '');
    assert.deepEqual(calls, [
      ...(mode === 'year' ? [] : ['datePicker.yearFormat']),
      ...(mode === 'date' || mode === 'week' ? ['datePicker.monthFormat'] : []),
    ]);
  });
}
for (const format of [
  undefined,
  null,
  0,
  false,
  {},
  ['YY'],
  Object('YY'),
  'datePicker.yearFormat',
] as const) {
  test(`Date header language fallback rejects ${String(format)}`, () =>
    assert.equal(
      createDatePanelHeaderLabels(
        { mode: 'date', value: dayjs('2025-07-08') },
        () => format,
      ).getYear(),
      '2025',
    ));
}
test('Date header accepts empty and custom formats without fallback coercion', () => {
  const used: Array<string | undefined> = [],
    value = {
      format(template?: string) {
        assert.equal(this, value);
        used.push(template);
        return template ?? 'missing';
      },
    },
    labels = createDatePanelHeaderLabels({ mode: 'date', value }, (key) =>
      key.endsWith('yearFormat') ? '' : 'MMM',
    );
  assert.equal(labels.getYear(), '');
  assert.equal(labels.getMonth(), 'MMM');
  assert.deepEqual(used, ['', 'MMM']);
});
test('Date header is lazy and unsupported modes/nullish values skip all method/translation reads', () => {
  let reads = 0;
  const labels = createDatePanelHeaderLabels(
    {
      mode: 'year',
      get value() {
        reads++;
        throw Error('value');
      },
    },
    () => {
      throw Error('translate');
    },
  );
  assert.equal(reads, 0);
  assert.equal(labels.getYear(), '');
  assert.equal(labels.getMonth(), '');
  assert.equal(reads, 0);
  for (const value of [undefined, null]) {
    const api = createDatePanelHeaderLabels({ mode: 'date', value: value as undefined }, () => {
      throw Error('translate');
    });
    assert.equal(api.getYear(), '');
    assert.equal(api.getMonth(), '');
  }
});
test('Date header retains live mode/value reads and original format receiver lookup before translation', () => {
  const trace: unknown[] = [],
    first = {
      format() {
        throw Error('truth guard only');
      },
    },
    second = {
      get format() {
        trace.push('format lookup');
        return function (this: unknown, format?: string) {
          trace.push(['format', this === second, format]);
          return 'result';
        };
      },
    };
  let reads = 0;
  const state = {
    get mode() {
      trace.push('mode');
      return 'date' as const;
    },
    get value() {
      trace.push('value');
      return ++reads === 1 ? first : second;
    },
  };
  const translate = function (this: unknown, key: string) {
    assert.equal(this, undefined);
    trace.push(['translate', key]);
    return 'YY';
  };
  assert.equal(createDatePanelHeaderLabels(state, translate).getYear(), 'result');
  assert.deepEqual(trace, [
    'mode',
    'value',
    'value',
    'format lookup',
    ['translate', 'datePicker.yearFormat'],
    ['format', true, 'YY'],
  ]);
});
test('Date header preserves cached method and receiver when translation changes the current value', () => {
  const value = {
      format(template?: string) {
        assert.equal(this, value);
        assert.equal(template, 'YY');
        return 'original';
      },
    },
    state: DatePanelHeaderLabelState = { mode: 'date', value };
  const mutable = state as { mode: 'date'; value: typeof value };
  const api = createDatePanelHeaderLabels(state, () => {
    value.format = () => 'replacement';
    mutable.value = { format: () => 'new value' };
    return 'YY';
  });
  assert.equal(api.getYear(), 'original');
  assert.equal(api.getYear(), 'new value');
});
test('Date header propagates translation and missing second-value errors without rewriting them', () => {
  const failure = Error('translation');
  assert.throws(
    () =>
      createDatePanelHeaderLabels({ mode: 'date', value: dayjs() }, () => {
        throw failure;
      }).getMonth(),
    (error) => error === failure,
  );
  let reads = 0;
  assert.throws(
    () =>
      createDatePanelHeaderLabels(
        {
          mode: 'date',
          get value() {
            return ++reads === 1 ? dayjs() : undefined;
          },
        },
        (key) => key,
      ).getYear(),
    TypeError,
  );
});
