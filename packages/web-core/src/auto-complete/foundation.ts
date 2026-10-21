import type { FilterOption, SelectOptionData, SelectOptionInfo } from '../select/types.js';

import { isFunction, isNull, isUndefined } from '../_utils/is.js';

export const strictFilterOption = (input: string, option: SelectOptionData) =>
  Boolean(String(option.label ?? option.value ?? '').includes(input));

export function getAutoCompleteFilter(filter: FilterOption, strict: boolean): FilterOption {
  if (isFunction(filter)) return filter;
  if (filter && strict) return strictFilterOption;
  return filter;
}

export function createAutoComplete(adapter: {
  readonly readonly: boolean | string;
  readonly disabled: boolean;
  readonly options: ReadonlyMap<string, SelectOptionInfo>;
  setInner(value: string): void;
  setPopup(value: boolean): void;
  onUpdate(value: string): void;
  onChange(value: string): void;
  onFormChange(): void;
  onSelect(value: string): void;
  onSearch(value: string): void;
  onClear(event: Event): void;
  blur(): void;
}) {
  function change(value: string) {
    adapter.setInner(value);
    adapter.onUpdate(value);
    adapter.onChange(value);
    adapter.onFormChange();
  }
  return {
    change,
    syncValue(value: unknown) {
      if (isUndefined(value) || isNull(value)) adapter.setInner('');
    },
    syncDisabled() {
      if (adapter.disabled || adapter.readonly) adapter.setPopup(false);
    },
    popup(value: boolean) {
      if (value && (adapter.readonly || adapter.disabled)) return;
      adapter.setPopup(value);
    },
    clear(event: Event) {
      change('');
      adapter.onClear(event);
    },
    select(key: string, _event: Event) {
      if (adapter.readonly || adapter.disabled) return;
      const value = String(adapter.options.get(key)?.value ?? '');
      adapter.onSelect(value);
      change(value);
      adapter.blur();
    },
    input(value: string) {
      adapter.onSearch(value);
      change(value);
    },
  };
}
