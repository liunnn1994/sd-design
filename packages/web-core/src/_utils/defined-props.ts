import { omitBy } from 'es-toolkit';

/** Forward optional options to APIs that distinguish omission from an explicit `undefined`. */
export function definedProps<T extends object>(
  props: T,
): { [K in keyof T]?: Exclude<T[K], undefined> } {
  return omitBy(props, (value) => value === undefined) as {
    [K in keyof T]?: Exclude<T[K], undefined>;
  };
}
