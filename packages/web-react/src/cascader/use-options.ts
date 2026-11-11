import type { CascaderLoader } from '@sdata/web-core/cascader/lazy-load';
import type {
  CascaderFieldNames,
  CascaderLazyLoadOptions,
  CascaderOption,
  CascaderOptionInfo,
} from '@sdata/web-core/cascader/types';

import { DEFAULT_FIELD_NAMES, getOptionInfos } from '@sdata/web-core/cascader/data';
import { useState } from 'react';

import { useCascaderLazyLoad } from './use-lazy-load.js';

export function useCascaderOptions<P>(props: {
  options?: CascaderOption<P>[];
  fieldNames?: CascaderFieldNames;
  valueKey?: string;
  checkStrictly?: boolean;
  loadMore?: CascaderLoader<P>;
}) {
  const [lazyLoadOptions, setLazyLoadOptions] = useState<CascaderLazyLoadOptions<P>>({});
  const optionMap = new Map<string, CascaderOptionInfo<P>>();
  const leafOptionMap = new Map<string, CascaderOptionInfo<P>>();
  const leafOptionSet = new Set<CascaderOptionInfo<P>>();
  const leafOptionValueMap = new Map<string | number, string>();
  const totalLevel = { value: 1 };
  const options = getOptionInfos(props.options ?? [], {
    optionMap,
    leafOptionMap,
    leafOptionSet,
    leafOptionValueMap,
    totalLevel,
    enabledLazyLoad: !!props.loadMore,
    lazyLoadOptions,
    checkStrictly: { value: props.checkStrictly ?? false },
    valueKey: { value: props.valueKey ?? 'value' },
    fieldNames: { ...DEFAULT_FIELD_NAMES, ...props.fieldNames },
  });
  const lazy = useCascaderLazyLoad(props.loadMore, optionMap, (children, key) => {
    const source = optionMap.get(key)?.raw;
    if (source) setLazyLoadOptions((previous) => ({ ...previous, [key]: { source, children } }));
  });
  return {
    options,
    optionMap,
    leafOptionMap,
    leafOptionSet,
    leafOptionValueMap,
    totalLevel: totalLevel.value,
    ...lazy,
  };
}
