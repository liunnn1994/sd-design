import type { SelectOptionInfo, SelectOptionValue } from '../select/types.js';
import type { MeasureInfo } from './types.js';

import { isNull, isUndefined } from '../_utils/is.js';
import { getLastMeasureIndex, getTextBeforeSelection, isValidSearch } from './utils.js';

export function getEmptyMeasureInfo(): MeasureInfo {
  return { measuring: false, location: -1, prefix: '', text: '' };
}

export function getMentionValue(
  value: string,
  measure: MeasureInfo,
  selected: SelectOptionValue | undefined,
  split: string,
) {
  const measureEnd = measure.location + measure.text.length;
  let head = value.slice(0, measure.location);
  let tail = value.slice(measureEnd + measure.prefix.length);
  head += !head || head.endsWith(split) || head.endsWith('\n') ? '' : split;
  tail = (!tail || tail.startsWith(split) || tail.startsWith('\n') ? '' : split) + tail;
  return `${head}${measure.prefix}${selected}${tail}`;
}

export function createMention(adapter: {
  readonly props: { prefix: string | string[]; split: string; readonly: boolean | string };
  readonly value: string;
  readonly options: ReadonlyMap<string, SelectOptionInfo>;
  measure: MeasureInfo;
  setInner(value: string): void;
  setPopup(value: boolean): void;
  onSearch(value: string, prefix: string): void;
  onUpdate(value: string): void;
  onChange(value: string): void;
  onFormChange(): void;
  onSelect(value: string | number | Record<string, unknown> | undefined): void;
  onClear(event: Event): void;
}) {
  function reset() {
    adapter.measure = getEmptyMeasureInfo();
  }
  return {
    syncValue(value: unknown) {
      if (isUndefined(value) || isNull(value)) adapter.setInner('');
    },
    input(value: string, event: Event) {
      if (adapter.props.readonly) return;
      const text = getTextBeforeSelection(event.target as HTMLInputElement);
      const last = getLastMeasureIndex(text, adapter.props.prefix);
      if (last.location > -1) {
        const query = text.slice(last.location + last.prefix.length);
        if (isValidSearch(query, adapter.props.split)) {
          adapter.setPopup(true);
          adapter.measure = { measuring: true, text: query, ...last };
          adapter.onSearch(query, last.prefix);
        } else if (adapter.measure.location > -1) reset();
      } else if (adapter.measure.location > -1) reset();
      adapter.setInner(value);
      adapter.onUpdate(value);
      adapter.onChange(value);
      adapter.onFormChange();
    },
    clear(event: Event) {
      adapter.setInner('');
      reset();
      adapter.setPopup(false);
      adapter.onUpdate('');
      adapter.onChange('');
      adapter.onFormChange();
      adapter.onClear(event);
    },
    popup(value: boolean) {
      adapter.setPopup(value);
    },
    select(key: string, _event: Event) {
      const { value } = adapter.options.get(key) ?? {};
      const next = getMentionValue(adapter.value, adapter.measure, value, adapter.props.split);
      adapter.setInner(next);
      adapter.onSelect(value as string | number | Record<string, unknown> | undefined);
      adapter.onUpdate(next);
      adapter.onChange(next);
      reset();
      adapter.onFormChange();
    },
  };
}
