import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { NumberFlowPhase } from '../src/number-flow/foundation.ts';
import type { NumberFlowPlugin } from '../src/number-flow/types.ts';

import { continuous } from '../dist/number-flow/continuous.js';
import { formatNumberFlow } from '../dist/number-flow/formatter.js';
import {
  createNumberFlow,
  createNumberFlowDigits,
  getHighestChangedPosition,
  getNumberFlowStyles,
} from '../dist/number-flow/foundation.js';
import { createNumberFlowGroup } from '../dist/number-flow/group.js';
import { observeNumberFlowMotion } from '../dist/number-flow/motion.js';
import {
  getNumberFlowTrend,
  parseDuration,
  sanitizeDuration,
  sanitizeEasing,
  sanitizeValue,
} from '../dist/number-flow/utils.js';

const formatter = new Intl.NumberFormat('en-US', { useGrouping: false });
const data = (value: number) => formatNumberFlow(value, formatter);

test('number default trend follows direction while explicit zero and callbacks retain precedence', () => {
  assert.equal(getNumberFlowTrend(undefined, 100, 200), 1);
  assert.equal(getNumberFlowTrend(undefined, 200, 100), -1);
  assert.equal(getNumberFlowTrend(undefined, 100, 100), 0);
  assert.equal(getNumberFlowTrend(0, 100, 200), 0);
  assert.equal(
    getNumberFlowTrend((previous, current) => previous - current, 100, 200),
    -100,
  );
});

test('number formatting preserves positional identity, sign normalization and affixes', () => {
  const value = formatNumberFlow(
    '-1234.5ignored',
    new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }),
    '$',
    ' USD',
  );
  assert.equal(value.valueAsString, '$-1,234.50 USD');
  assert.deepEqual(
    value.parts.filter((part) => part.digit !== undefined).map((part) => [part.key, part.digit]),
    [
      ['integer:3', 1],
      ['integer:2', 2],
      ['integer:1', 3],
      ['integer:0', 4],
      ['fraction:-1', 5],
      ['fraction:-2', 0],
    ],
  );
  assert.equal(value.parts.find((part) => part.type === 'sign')?.value, '-');
  assert.equal(value.parts[0].type, 'prefix');
  assert.equal(value.parts.at(-1)?.type, 'suffix');
});

test('number formatter caches localized Unicode digit characters by formatter identity', () => {
  const formatter = new Intl.NumberFormat('ar-EG-u-nu-arab');
  const value = formatNumberFlow(12, formatter);
  assert.equal(value.valueAsString, formatter.format(12));
  assert.deepEqual(
    value.parts.filter((part) => part.digit !== undefined).map((part) => part.digit),
    [1, 2],
  );
  assert.equal(value.digitCharacters, formatNumberFlow(34, formatter).digitCharacters);
  assert.notEqual(
    value.digitCharacters,
    formatNumberFlow(12, new Intl.NumberFormat('en-US')).digitCharacters,
  );
});

test('number value and duration parsing retain permissive prefixes, infinity and negative numeric duration', () => {
  assert.equal(sanitizeValue('12.5suffix'), 12.5);
  assert.equal(sanitizeValue('invalid'), 0);
  assert.equal(sanitizeValue(NaN), 0);
  assert.equal(sanitizeValue(Infinity), Infinity);
  assert.equal(parseDuration(' 2S ', 900), 2000);
  assert.equal(parseDuration('500ms', 900), 500);
  assert.equal(parseDuration('-2s', 900), 900);
  assert.equal(parseDuration(-2, 900), -2);
  assert.equal(parseDuration(Infinity, 900), 900);
  assert.equal(sanitizeDuration(-2), 0);
  assert.equal(sanitizeEasing('steps(4, end)'), 'steps(4, end)');
  assert.equal(sanitizeEasing('linear;}body{color:red}'), 'linear');
});

function digits(previous = 9, current = 0, trend = 1, plugins: NumberFlowPlugin[] = []) {
  const adapter = {
    previous: data(previous),
    current: data(current),
    trend,
    plugins,
    phase: 'animating' as NumberFlowPhase,
    digits: undefined,
    get highestChangedPosition() {
      return getHighestChangedPosition(this.previous, this.current);
    },
  };
  const controller = createNumberFlowDigits(adapter);
  const part = adapter.current.parts.find((part) => part.position === 0)!;
  return { adapter, controller, part };
}

test('number digits wrap in either direction and preserve idle versus prepared sequences', () => {
  const up = digits();
  assert.equal(up.controller.delta(up.part), 1);
  assert.deepEqual(
    up.controller.sequence(up.part).map((step) => step.value),
    ['9', '0'],
  );
  up.adapter.phase = 'prepared';
  assert.equal(up.controller.sequence(up.part).length, 2);
  up.adapter.phase = 'idle';
  assert.deepEqual(up.controller.sequence(up.part), [{ key: 'current-0', value: '0' }]);
  const down = digits(0, 9, -1);
  assert.equal(down.controller.delta(down.part), -1);
  assert.deepEqual(
    down.controller.sequence(down.part).map((step) => step.value),
    ['9', '0'],
  );
});

test('number plugins use first defined delta including zero and continuous sees highest changed position', () => {
  const d = digits(100, 200, 1, [continuous]);
  assert.equal(d.adapter.highestChangedPosition, 2);
  assert.equal(d.controller.delta(d.part), 10);
  assert.equal(d.controller.sequence(d.part).length, 11);
  d.adapter.plugins = [
    { getDelta: () => 0 },
    {
      getDelta: () => {
        assert.fail('plugin after zero');
      },
    },
  ];
  assert.equal(d.controller.delta(d.part), 0);
  d.adapter.plugins = [{ getDelta: () => undefined }, { getDelta: () => -3 }];
  assert.equal(d.controller.delta(d.part), -3);
  assert.equal(getHighestChangedPosition(data(1), data(1)), undefined);
});

test('number digits use configured radix and newly introduced positions start at current digit', () => {
  const d = digits(5, 0);
  const controller = createNumberFlowDigits({ ...d.adapter, digits: { 0: { max: 5 } } });
  assert.equal(controller.delta(d.part), 1);
  assert.deepEqual(
    controller.sequence(d.part).map((step) => step.value),
    ['5', '0'],
  );
  const added = digits(9, 19);
  const tens = added.adapter.current.parts.find((part) => part.position === 1)!;
  assert.equal(added.controller.delta(tens), 0);
});

test('number dynamic styles preserve sanitized timings and skip non-digit parts', () => {
  const adapter = {
    scope: 'scope',
    transformDuration: -1,
    transformEasing: 'bad;css',
    spinDuration: 20,
    spinEasing: 'ease-out',
    opacityDuration: 30,
    parts: formatNumberFlow(-1, formatter).parts,
    delta: () => -2,
  };
  assert.equal(
    getNumberFlowStyles(adapter),
    '[data-number-flow-id="scope"]{--sd-number-flow-duration:0ms;--sd-number-flow-easing:linear;--sd-number-flow-spin-duration:20ms;--sd-number-flow-spin-easing:ease-out;--sd-number-flow-opacity-duration:30ms}[data-number-flow-id="scope"] [data-number-flow-part="1"]{--sd-number-flow-start:-2;--sd-number-flow-end:0}',
  );
  assert.equal(
    getNumberFlowStyles({
      ...adapter,
      scope: undefined,
      delta: () => {
        assert.fail('SSR delta');
      },
    }),
    '',
  );
});

function animation() {
  let id = 0;
  const callbacks = new Map<number, () => void>();
  const events: unknown[][] = [];
  const adapter = {
    previous: data(1),
    current: data(2),
    phase: 'idle' as NumberFlowPhase,
    plugins: [] as NumberFlowPlugin[],
    trend: 1,
    canAnimate: true,
    spinDuration: 300,
    transformDuration: 100,
    opacityDuration: 200,
    readLayout: () => {
      events.push(['layout']);
    },
    setTimer(callback: () => void, delay: number) {
      events.push(['timer', delay]);
      callbacks.set(++id, callback);
      return id;
    },
    clearTimer(timer: number | undefined) {
      callbacks.delete(timer!);
    },
    start: () => {
      events.push(['start']);
    },
    finish: () => {
      events.push(['finish']);
    },
  };
  return { adapter, events, callbacks, controller: createNumberFlow(adapter) };
}

test('number animation updates plugins before preparation and emits start before scheduling longest fallback', () => {
  const a = animation();
  a.adapter.plugins = [
    {
      onUpdate: (context) => {
        assert.equal(a.adapter.previous.value, 1);
        a.events.push(['plugin', context]);
      },
    },
  ];
  const version = a.controller.prepare(data(1), a.adapter.current)!;
  assert.equal(a.adapter.phase, 'prepared');
  assert.equal(a.controller.commit(version), true);
  a.controller.start(version);
  assert.deepEqual(a.events, [
    ['plugin', { value: 2, previousValue: 1, trend: 1 }],
    ['layout'],
    ['start'],
    ['timer', 350],
  ]);
  [...a.callbacks.values()][0]();
  assert.equal(a.adapter.phase, 'idle');
  assert.equal(a.adapter.previous, a.adapter.current);
  assert.deepEqual(a.events.at(-1), ['finish']);
  assert.equal(a.callbacks.size, 0);
});

test('number stale versions cannot commit/start/finish after rapid replacement or disposal', () => {
  const a = animation();
  const first = a.controller.prepare(data(1), data(2))!;
  a.controller.start(first);
  const staleFinish = [...a.callbacks.values()][0];
  a.adapter.current = data(3);
  const second = a.controller.prepare(data(2), a.adapter.current)!;
  assert.equal(a.controller.commit(first), false);
  a.controller.start(first);
  staleFinish();
  assert.equal(a.adapter.phase, 'prepared');
  assert.equal(a.callbacks.size, 0);
  a.controller.dispose();
  assert.equal(a.controller.commit(second), false);
  a.controller.start(second);
  assert.equal(a.events.filter((event) => event[0] === 'start').length, 1);
  assert.equal(a.events.filter((event) => event[0] === 'finish').length, 0);
});

test('number unchanged and disabled animations still notify plugins but stay idle without finish', () => {
  const a = animation();
  let updates = 0;
  a.adapter.plugins = [
    {
      onUpdate: () => {
        updates++;
      },
    },
  ];
  assert.equal(a.controller.prepare(data(2), data(2)), undefined);
  assert.equal(a.adapter.phase, 'idle');
  a.adapter.canAnimate = false;
  assert.equal(a.controller.prepare(data(1), data(2)), undefined);
  assert.equal(updates, 2);
  assert.equal(a.events.length, 0);
});

test('number group prepares all, reads all layouts, then starts only committed children', async () => {
  const events: string[] = [];
  const group = createNumberFlowGroup({
    afterRender: async () => {
      events.push('render');
    },
  });
  for (const [id, version, commit] of [
    ['a', 1, true],
    ['b', undefined, true],
    ['c', 2, false],
    ['d', 3, true],
  ] as const) {
    group.register({
      prepare: () => {
        events.push('prepare ' + id);
        return version;
      },
      commit: () => {
        events.push('commit ' + id);
        return commit;
      },
      start: () => {
        events.push('start ' + id);
      },
    });
  }
  await group.animate();
  assert.deepEqual(events, [
    'prepare a',
    'prepare b',
    'prepare c',
    'prepare d',
    'render',
    'commit a',
    'commit c',
    'commit d',
    'start a',
    'start d',
  ]);
});

test('number group coalesces updates while awaiting render and unregisters for subsequent passes', async () => {
  const renders: Array<() => void> = [];
  const events: string[] = [];
  let version = 0;
  const group = createNumberFlowGroup({
    afterRender: () =>
      new Promise<void>((resolve) => {
        renders.push(resolve);
      }),
  });
  const remove = group.register({
    prepare: () => ++version,
    commit: () => true,
    start: (v) => {
      events.push(String(v));
    },
  });
  const pending = group.animate();
  await group.animate();
  await group.animate();
  renders.shift()!();
  await Promise.resolve();
  assert.equal(version, 2);
  remove();
  renders.shift()!();
  await pending;
  assert.deepEqual(events, ['1', '2']);
  await group.animate();
  assert.equal(version, 2);
});

test('number group releases its update lock after a preparation error', async () => {
  const group = createNumberFlowGroup({ afterRender: async () => {} });
  let fail = true;
  let starts = 0;
  group.register({
    prepare: () => {
      if (fail) throw new Error('plugin failure');
      return 1;
    },
    commit: () => true,
    start: () => {
      starts++;
    },
  });
  await assert.rejects(group.animate(), /plugin failure/);
  fail = false;
  await group.animate();
  assert.equal(starts, 1);
});

test('number native motion observation refreshes current matches and removes its exact listener', () => {
  let listener: ((event: { matches: boolean }) => void) | undefined;
  const values: boolean[] = [];
  const query = {
    matches: true,
    addEventListener: (name: string, handler: typeof listener) => {
      assert.equal(name, 'change');
      listener = handler;
    },
    removeEventListener: (name: string, handler: typeof listener) => {
      assert.equal(name, 'change');
      assert.equal(listener, handler);
      listener = undefined;
    },
  };
  const cleanup = observeNumberFlowMotion(query as unknown as MediaQueryList, (value) => {
    values.push(value);
  });
  listener!({ matches: false });
  cleanup();
  assert.deepEqual(values, [true, false]);
  assert.equal(listener, undefined);
  observeNumberFlowMotion(undefined, () => {
    assert.fail('unmounted query');
  })();
});
