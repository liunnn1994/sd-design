import { isNumber, isString } from './is.js';

export function normalizeChoiceOptions<T extends { value: string | number }>(
  options: (string | number | T)[] | undefined,
) {
  return (options ?? []).map((option) =>
    isString(option) || isNumber(option) ? { label: option, value: option } : option,
  );
}
