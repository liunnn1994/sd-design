import { isUndefined } from '../_utils/is.js';

export function resolveLegacyMergedValue<T, E>(state: {
  readonly value: E;
  readonly fallback: T;
}): T | E {
  return !isUndefined(state.value) ? state.value : state.fallback;
}

export function syncLegacyMergedValue(value: unknown, clearLocalValue: () => void): void {
  if (isUndefined(value)) {
    clearLocalValue();
  }
}
