import type {
  CascaderModelValue,
  CascaderOption,
  CascaderOptionInfo,
  CascaderSingleValue,
} from './types.js';

import { isArray, isFunction } from '../_utils/is.js';
import { getOptionLabel, getValidValues, getValueKey } from './data.js';

export function getDefaultCascaderValue(multiple: boolean, pathMode: boolean): CascaderModelValue {
  if (multiple) return [];
  return pathMode ? undefined : '';
}
export function getCascaderValueMap(
  value: CascaderModelValue,
  options: {
    multiple: boolean;
    pathMode: boolean;
    valueKey: string;
    leafOptionValueMap: Map<string | number, string>;
  },
) {
  return new Map<string, CascaderSingleValue>(
    getValidValues(value, options).map((value) => [getValueKey(value, options), value]),
  );
}
export function filterCascaderOptions<P>(
  options: CascaderOptionInfo<P>[],
  input: string,
  strictly: boolean,
  method?: (input: string, raw: CascaderOption<P>) => boolean,
) {
  const matches = (label: string) =>
    label?.toLocaleLowerCase().includes(input?.toLocaleLowerCase());
  return options.filter((item) => {
    if (isFunction(method)) return method(input, item.raw);
    if (strictly) return matches(item.label);
    return item.path?.find((part) => matches(part.label));
  });
}
export function getCascaderViewValues<P>(
  values: Map<string, CascaderSingleValue>,
  leaves: Map<string, CascaderOptionInfo<P>>,
  options: {
    showPath: boolean;
    separator: string;
    formatLabel?: (options: CascaderOption<P>[]) => string;
    fallback: boolean | ((value: CascaderSingleValue) => string);
  },
) {
  const result: { value: string; label: string; closable: boolean; tagProps?: P }[] = [];
  values.forEach((value, key) => {
    const option = leaves.get(key);
    if (option)
      result.push({
        value: key,
        label:
          options.formatLabel?.(option.path.map((item) => item.raw)) ??
          getOptionLabel(option, options),
        closable: !option.disabled,
        tagProps: option.tagProps,
      });
    else if (options.fallback) {
      let label: string;
      if (isFunction(options.fallback)) label = options.fallback(value);
      else if (isArray(value))
        label = options.showPath
          ? value.map((item) => String(item)).join(options.separator)
          : String(value[value.length - 1] ?? '');
      else label = String(value);
      result.push({ value: key, label, closable: true });
    }
  });
  return result;
}
