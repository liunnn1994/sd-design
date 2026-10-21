import type { Dayjs } from 'dayjs';

import type { TimeValue } from './types.js';

import { isArray, isUndefined } from '../_utils/is.js';

export function getEmptyTimeValue(range: boolean): Dayjs[] | undefined {
  return range ? [] : undefined;
}

export function normalizeTimeValue(value: TimeValue | TimeValue[] | undefined, range: boolean) {
  if (isUndefined(value)) return undefined;
  return range && !isArray(value) ? [value, undefined] : value;
}

export function getInitialTimeValue(
  model: Dayjs | Array<Dayjs | undefined> | undefined,
  getFallback: () => Dayjs | Array<Dayjs | undefined> | undefined,
  range: boolean,
) {
  if (!isUndefined(model)) return model;
  const fallback = getFallback();
  return !isUndefined(fallback) ? fallback : getEmptyTimeValue(range);
}
