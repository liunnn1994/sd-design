import { onBeforeUnmount, shallowReactive, toRaw, type Ref } from 'vue';

import type { CascaderLoadMore, CascaderOption, CascaderOptionInfo } from '../interface';

export function useLazyLoad(
  loader: Ref<CascaderLoadMore | undefined>,
  options: Map<string, CascaderOptionInfo>,
  addChildren: (children: CascaderOption[], key: string) => void,
) {
  const pending = shallowReactive(new Map<string, { source: CascaderOption }>());
  let disposed = false;
  onBeforeUnmount(() => {
    disposed = true;
    pending.clear();
  });

  const isLoading = (option: CascaderOptionInfo) =>
    pending.get(option.key)?.source === toRaw(option.raw);

  const loadOption = (option: CascaderOptionInfo) => {
    if (
      disposed ||
      !loader.value ||
      option.disabled ||
      option.isLeaf ||
      option.children ||
      isLoading(option)
    )
      return;
    const { key } = option;
    const request = { source: toRaw(option.raw) };
    pending.set(key, request);
    new Promise<CascaderOption[] | undefined>((resolve, reject) => {
      Promise.resolve(loader.value?.(option.raw, resolve)).catch(reject);
    })
      .then((children) => {
        if (
          !disposed &&
          pending.get(key) === request &&
          toRaw(options.get(key)?.raw) === request.source &&
          children
        ) {
          addChildren(children, key);
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (pending.get(key) === request) pending.delete(key);
      });
  };

  return { loadOption, isLoading };
}
