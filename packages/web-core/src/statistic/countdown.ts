import dayjs from 'dayjs';

import { getDateString } from './utils.js';

export function getCountdownDisplay(value: number, now: number, format: string) {
  return getDateString(Math.max(dayjs(value).diff(dayjs(now), 'millisecond'), 0), format);
}

export function getCountdownParts(display: string) {
  return display
    .split(/(\d+)/)
    .flatMap((value) => (value ? [{ type: /^\d+$/.test(value) ? 'number' : 'text', value }] : []));
}

export function createCountdown(adapter: {
  readonly props: { value: number; now: number; format: string; start: boolean };
  display: string;
  now(): number;
  setInterval(callback: () => void, delay: number): number;
  clearInterval(timer: number): void;
  finish(): void;
}) {
  let timer = 0;
  let finished = false;
  const stop = () => {
    if (timer) {
      adapter.clearInterval(timer);
      timer = 0;
    }
  };
  const finish = () => {
    stop();
    adapter.display = getDateString(0, adapter.props.format);
    if (!finished) {
      finished = true;
      adapter.finish();
    }
  };
  const start = () => {
    if (dayjs(adapter.props.value).valueOf() <= adapter.now()) {
      finish();
      return;
    }
    timer = adapter.setInterval(() => {
      const remaining = dayjs(adapter.props.value).diff(dayjs(adapter.now()), 'millisecond');
      if (remaining <= 0) {
        finish();
        return;
      }
      adapter.display = getDateString(Math.max(remaining, 0), adapter.props.format);
    }, 1000 / 30);
  };
  return {
    stop,
    mount() {
      if (dayjs(adapter.props.value).valueOf() <= adapter.now()) finish();
      else if (adapter.props.start) start();
    },
    syncValue(previousDeadline: number) {
      if (adapter.props.value !== previousDeadline) finished = false;
      if (!adapter.props.start) return;
      const value = getCountdownDisplay(
        adapter.props.value,
        adapter.props.now,
        adapter.props.format,
      );
      if (value !== adapter.display) adapter.display = value;
      if (!timer && dayjs(adapter.props.value).valueOf() > adapter.now()) start();
    },
    syncStart(value: boolean) {
      if (value && !timer) start();
      else if (!value) stop();
    },
  };
}
