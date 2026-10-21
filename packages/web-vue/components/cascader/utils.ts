import type { Ref } from 'vue';
import { toRaw } from 'vue';

import * as shared from '@sdata/web-core/cascader/data';

import type { BaseType } from '../_utils/types';
import type { TagProps } from '../tag';
import type {
  CascaderLazyLoadOptions,
  CascaderFieldNames,
  CascaderOption,
  CascaderOptionInfo,
  CascaderModelValue,
  CascaderSingleValue,
} from './interface';

export const getOptionInfos = (
  options: CascaderOption[],
  config: {
    optionMap: Map<string, CascaderOptionInfo>;
    leafOptionMap: Map<string, CascaderOptionInfo>;
    leafOptionSet: Set<CascaderOptionInfo>;
    leafOptionValueMap: Map<BaseType, string>;
    totalLevel: Ref<number>;
    checkStrictly: Ref<boolean>;
    enabledLazyLoad: boolean;
    lazyLoadOptions: CascaderLazyLoadOptions;
    valueKey: Ref<string>;
    fieldNames: Required<CascaderFieldNames>;
  },
): CascaderOptionInfo[] => shared.getOptionInfos<TagProps>(options, { ...config, unwrap: toRaw });
export const getCheckedStatus: (
  option: CascaderOptionInfo,
  values?: Map<string, unknown>,
) => { checked: boolean; indeterminate: boolean } = shared.getCheckedStatus;
export const getLeafOptionKeys: (option: CascaderOptionInfo) => string[] = shared.getLeafOptionKeys;
export const getLeafOptionInfos: (option: CascaderOptionInfo) => CascaderOptionInfo[] =
  shared.getLeafOptionInfos;
export const getValueKey: (
  value: CascaderSingleValue,
  options: { valueKey: string; leafOptionValueMap: Map<BaseType, string> },
) => string = shared.getValueKey;
export const getValidValues: (
  value: CascaderModelValue,
  options: { multiple: boolean; pathMode: boolean },
) => CascaderSingleValue[] = shared.getValidValues;
export const getOptionLabel: (
  option: CascaderOptionInfo,
  options?: { separator?: string; showPath?: boolean },
) => string = shared.getOptionLabel;
