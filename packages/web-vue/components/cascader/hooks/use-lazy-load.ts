import { onBeforeUnmount, shallowReactive, toRaw, type Ref } from 'vue';

import { createCascaderLazyLoad } from '@sdata/web-core/cascader/lazy-load';

import type { TagProps } from '../../tag';
import type { CascaderLoadMore, CascaderOption, CascaderOptionInfo } from '../interface';

export function useLazyLoad(
  loader: Ref<CascaderLoadMore | undefined>,
  options: Map<string, CascaderOptionInfo>,
  addChildren: (children: CascaderOption[], key: string) => void,
) {
  const pending = shallowReactive(new Map<string, { source: CascaderOption }>());
  const foundation = createCascaderLazyLoad<TagProps>({
    getLoader: () => loader.value,
    getOptions: () => options,
    getPending: () => pending,
    setPending: (key, request) => {
      pending.set(key, request);
    },
    deletePending: (key) => {
      pending.delete(key);
    },
    clearPending: () => pending.clear(),
    unwrap: toRaw,
    addChildren,
  });
  onBeforeUnmount(foundation.dispose);
  return {
    loadOption: (option: CascaderOptionInfo) => foundation.loadOption(option),
    isLoading: (option: CascaderOptionInfo) => foundation.isLoading(option),
  };
}
