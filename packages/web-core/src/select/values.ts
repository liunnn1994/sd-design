import type { SelectModelValue, SelectOptionValue, OptionValueWithKey } from './types.js';

import { isArray, isBoolean, isNumber, isString } from '../_utils/is.js';
import { getKeyFromValue } from './options.js';
export function getValueObjects(
  mergedValue: SelectModelValue,
  valueKey: string,
): OptionValueWithKey[] {
  const valueArray: SelectOptionValue[] = [];

  if (isArray(mergedValue)) {
    valueArray.push(...mergedValue);
  } else if (
    mergedValue ||
    isNumber(mergedValue) ||
    isString(mergedValue) ||
    isBoolean(mergedValue)
  ) {
    valueArray.push(mergedValue);
  }

  return valueArray.map((item) => ({
    value: item,
    key: getKeyFromValue(item, valueKey),
  }));
}
export function hasExtraValueChanges(
  next: OptionValueWithKey[],
  current: OptionValueWithKey[],
  unwrap: (value: unknown) => unknown,
) {
  if (next.length !== current.length) return true;
  for (let index = 0; index < next.length; index++) {
    if (
      next[index].key !== current[index]?.key ||
      unwrap(next[index].value) !== unwrap(current[index]?.value)
    )
      return true;
  }
  return false;
}
