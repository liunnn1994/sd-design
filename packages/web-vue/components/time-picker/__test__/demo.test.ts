import { afterEach, beforeEach, vi } from 'vitest';

import demoTest from '../../../scripts/demo-test';

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-01-15T00:00:00'));
});

afterEach(() => {
  vi.useRealTimers();
});

demoTest('time-picker');
