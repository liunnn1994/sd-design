import { isArray } from './is.js';

export function toArray<T>(val: T | T[]): T[] {
  return isArray(val) ? val : [val];
}
