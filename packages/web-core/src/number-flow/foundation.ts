import type { NumberFlowData, NumberFlowPart } from './formatter.js';
import type { NumberFlowDigits, NumberFlowDigitContext, NumberFlowPlugin } from './types.js';

import { sanitizeDuration, sanitizeEasing } from './utils.js';

export type NumberFlowPhase = 'idle' | 'prepared' | 'animating';

export function getHighestChangedPosition(previous: NumberFlowData, current: NumberFlowData) {
  const previousDigits = new Map(
    previous.parts
      .filter((part) => part.digit !== undefined)
      .map((part) => [part.key, part] as const),
  );
  const changedPositions = current.parts.flatMap((part) => {
    if (part.digit === undefined) return [];
    const old = previousDigits.get(part.key);
    return old?.digit === part.digit ? [] : [part.position ?? 0];
  });
  return changedPositions.length === 0 ? undefined : Math.max(...changedPositions);
}

export function createNumberFlowDigits(adapter: {
  readonly previous: NumberFlowData;
  readonly current: NumberFlowData;
  readonly phase: NumberFlowPhase;
  readonly trend: number;
  readonly highestChangedPosition: number | undefined;
  readonly digits: NumberFlowDigits | undefined;
  readonly plugins: NumberFlowPlugin[] | undefined;
}) {
  const previousDigit = (part: NumberFlowPart) =>
    adapter.previous.parts.find((candidate) => candidate.key === part.key)?.digit ?? part.digit!;
  const length = (part: NumberFlowPart) => (adapter.digits?.[part.position ?? 0]?.max ?? 9) + 1;
  const delta = (part: NumberFlowPart) => {
    const current = part.digit!;
    const previous = previousDigit(part);
    const size = length(part);
    const context: NumberFlowDigitContext = {
      position: part.position ?? 0,
      length: size,
      trend: adapter.trend,
      highestChangedPosition: adapter.highestChangedPosition,
    };
    for (const plugin of adapter.plugins ?? []) {
      const result = plugin.getDelta?.(current, previous, context);
      if (result !== undefined) return result;
    }
    const difference = current - previous;
    if (adapter.trend < 0 && current > previous) return current - size - previous;
    if (adapter.trend > 0 && current < previous) return size - previous + current;
    return difference;
  };
  return {
    delta,
    sequence(part: NumberFlowPart) {
      const current = part.digit!;
      const previous = previousDigit(part);
      const distance = delta(part);
      if (adapter.phase === 'idle' || distance === 0)
        return [{ key: `current-${current}`, value: part.value }];
      const size = length(part);
      const start = distance > 0 ? previous : current;
      return Array.from({ length: Math.abs(distance) + 1 }, (_, index) => ({
        key: `step-${index}`,
        value: adapter.current.digitCharacters[(start + index) % size],
      }));
    },
  };
}

export function getNumberFlowStyles(adapter: {
  scope: string | undefined;
  transformDuration: number;
  transformEasing: string;
  spinDuration: number;
  spinEasing: string;
  opacityDuration: number;
  parts: NumberFlowPart[];
  delta(part: NumberFlowPart): number;
}) {
  if (!adapter.scope) return '';
  const rootSelector = `[data-number-flow-id="${adapter.scope}"]`;
  const rules = [
    `${rootSelector}{--sd-number-flow-duration:${sanitizeDuration(adapter.transformDuration)}ms;--sd-number-flow-easing:${sanitizeEasing(adapter.transformEasing)};--sd-number-flow-spin-duration:${sanitizeDuration(adapter.spinDuration)}ms;--sd-number-flow-spin-easing:${sanitizeEasing(adapter.spinEasing)};--sd-number-flow-opacity-duration:${sanitizeDuration(adapter.opacityDuration)}ms}`,
  ];
  adapter.parts.forEach((part, index) => {
    if (part.digit === undefined) return;
    const delta = adapter.delta(part);
    const distance = Math.abs(delta);
    rules.push(
      `${rootSelector} [data-number-flow-part="${index}"]{--sd-number-flow-start:${delta < 0 ? -distance : 0};--sd-number-flow-end:${delta > 0 ? -distance : 0}}`,
    );
  });
  return rules.join('');
}

export function createNumberFlow<Timer>(adapter: {
  previous: NumberFlowData;
  readonly current: NumberFlowData;
  phase: NumberFlowPhase;
  readonly plugins: NumberFlowPlugin[] | undefined;
  readonly trend: number;
  readonly canAnimate: boolean;
  readonly spinDuration: number;
  readonly transformDuration: number;
  readonly opacityDuration: number;
  readLayout(): void;
  setTimer(callback: () => void, delay: number): Timer;
  clearTimer(timer: Timer | undefined): void;
  start(): void;
  finish(): void;
}) {
  let version = 0;
  let timer: Timer | undefined;
  const finish = (expected = version) => {
    if (expected !== version || adapter.phase === 'idle') return;
    adapter.clearTimer(timer);
    timer = undefined;
    adapter.previous = adapter.current;
    adapter.phase = 'idle';
    adapter.finish();
  };
  return {
    prepare(oldData: NumberFlowData, data: NumberFlowData, force = false) {
      const next = ++version;
      adapter.clearTimer(timer);
      timer = undefined;
      adapter.previous = oldData;
      adapter.plugins?.forEach((plugin) =>
        plugin.onUpdate?.({
          value: data.value,
          previousValue: oldData.value,
          trend: adapter.trend,
        }),
      );
      if (!adapter.canAnimate || (!force && data.value === oldData.value)) {
        adapter.previous = data;
        adapter.phase = 'idle';
        return;
      }
      adapter.phase = 'prepared';
      return next;
    },
    commit(expected: number) {
      if (expected !== version || adapter.phase !== 'prepared') return false;
      adapter.readLayout();
      return true;
    },
    start(expected: number) {
      if (expected !== version || adapter.phase !== 'prepared') return;
      adapter.phase = 'animating';
      adapter.start();
      timer = adapter.setTimer(
        () => finish(expected),
        Math.max(adapter.spinDuration, adapter.transformDuration, adapter.opacityDuration) + 50,
      );
    },
    dispose() {
      version++;
      adapter.clearTimer(timer);
    },
  };
}
