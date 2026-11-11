import { cloneDeep } from 'es-toolkit';

import { setValueByPath } from '../_utils/get-value-by-path.js';

/** Immutable writeback for adapters whose model belongs to their caller. */
export function setFormModelValue<T extends Record<string, unknown>>(
  model: T,
  field: string,
  value: unknown,
): T {
  const next = cloneDeep(model);
  setValueByPath(next, field, value);
  return next;
}
