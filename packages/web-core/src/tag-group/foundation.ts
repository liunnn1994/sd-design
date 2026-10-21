import { isFunction, isString } from 'es-toolkit';
import { isNumber } from 'es-toolkit/compat';

import type { TagTooltipOptions } from '../tag/types.js';
import type {
  TagGroupObjectOption,
  TagGroupOption,
  TagGroupOptionLabel,
  TagGroupFieldNames,
  NormalizedTagGroupOption,
} from './types.js';

export const OVERFLOW_COUNTER_VALUE = '__sd_tag_group_more__';
type OptionFieldRecord = Record<string, unknown>;
export interface TagGroupState<Tooltip extends TagTooltipOptions = TagTooltipOptions> {
  readonly options: TagGroupOption<Tooltip>[];
  readonly fieldNames: TagGroupFieldNames;
  readonly maxCount: number | 'responsive';
  readonly normalizedOptions: NormalizedTagGroupOption<Tooltip>[];
  readonly visibleCount: number;
}
export function createTagGroupFoundation<Tooltip extends TagTooltipOptions = TagTooltipOptions>(
  state: TagGroupState<Tooltip>,
) {
  function resolveOptionField<T extends keyof TagGroupObjectOption<Tooltip>>(
    option: TagGroupObjectOption<Tooltip>,
    field: string,
    fallbackField: T,
  ) {
    const optionRecord = option as OptionFieldRecord;
    return (optionRecord[field] ?? option[fallbackField]) as TagGroupObjectOption<Tooltip>[T];
  }
  function normalizeItemProps(
    option: TagGroupObjectOption<Tooltip>,
    labelField: string,
    valueField: string,
  ) {
    if (
      option.itemProps &&
      typeof option.itemProps === 'object' &&
      !Array.isArray(option.itemProps)
    ) {
      return option.itemProps;
    }
    return Object.fromEntries(
      Object.entries(option as OptionFieldRecord).filter(
        ([key]) => key !== labelField && key !== valueField && key !== 'itemProps',
      ),
    );
  }
  function normalizeOption(
    option: TagGroupOption<Tooltip>,
    index: number,
  ): NormalizedTagGroupOption<Tooltip> {
    const { label = 'label', value = 'value' } = state.fieldNames;
    if (isString(option) || isNumber(option)) {
      return {
        key: `${String(option)}-${index}`,
        label: option,
        value: option,
        raw: { label: option, value: option },
        itemProps: {},
      };
    }
    const normalizedLabel = resolveOptionField(option, label, 'label') as TagGroupOptionLabel;
    const normalizedValue = resolveOptionField(option, value, 'value') as string | number;
    return {
      key: `${String(normalizedValue)}-${index}`,
      label: isFunction(normalizedLabel) ? normalizedLabel() : normalizedLabel,
      value: normalizedValue,
      raw: { ...option, label: normalizedLabel, value: normalizedValue },
      itemProps: normalizeItemProps(option, label, value),
    };
  }
  const getNormalizedOptions = () =>
    state.options.map((option, index) => normalizeOption(option, index));
  const getVisibleCount = () => {
    if (typeof state.maxCount === 'number' && state.maxCount > 0) {
      return Math.min(state.maxCount, state.normalizedOptions.length);
    }
    return state.normalizedOptions.length;
  };
  const getVisibleOptions = () => state.normalizedOptions.slice(0, state.visibleCount);
  const getHiddenOptions = () => state.normalizedOptions.slice(state.visibleCount);
  const resolveOptionLabel = (option: NormalizedTagGroupOption<Tooltip>) => {
    const label = option.raw.label;
    return isFunction(label) ? label() : option.label;
  };
  return {
    getNormalizedOptions,
    getVisibleCount,
    getVisibleOptions,
    getHiddenOptions,
    resolveOptionLabel,
  };
}
