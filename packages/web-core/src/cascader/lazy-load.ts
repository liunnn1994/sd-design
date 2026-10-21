import type { CascaderOption, CascaderOptionInfo } from './types.js';

export interface CascaderLoadRequest<P> {
  source: CascaderOption<P>;
}
export type CascaderLoader<P> = (
  option: CascaderOption<P>,
  done: (children?: CascaderOption<P>[]) => void,
) => void;
export interface CascaderLazyAdapter<P> {
  getLoader: () => CascaderLoader<P> | undefined;
  getOptions: () => ReadonlyMap<string, CascaderOptionInfo<P>>;
  getPending: () => ReadonlyMap<string, CascaderLoadRequest<P>>;
  setPending: (key: string, request: CascaderLoadRequest<P>) => void;
  deletePending: (key: string) => void;
  clearPending: () => void;
  unwrap: <T>(value: T) => T;
  addChildren: (children: CascaderOption<P>[], key: string) => void;
}

export function createCascaderLazyLoad<P>(adapter: CascaderLazyAdapter<P>) {
  let disposed = false;
  function dispose() {
    disposed = true;
    adapter.clearPending();
  }
  const isLoading = (option: CascaderOptionInfo<P>) =>
    adapter.getPending().get(option.key)?.source === adapter.unwrap(option.raw);
  const loadOption = (option: CascaderOptionInfo<P>) => {
    if (
      disposed ||
      !adapter.getLoader() ||
      option.disabled ||
      option.isLeaf ||
      option.children ||
      isLoading(option)
    )
      return;
    const { key } = option;
    const request = { source: adapter.unwrap(option.raw) };
    adapter.setPending(key, request);
    new Promise<CascaderOption<P>[] | undefined>((resolve, reject) => {
      Promise.resolve(adapter.getLoader()?.(option.raw, resolve)).catch(reject);
    })
      .then((children) => {
        if (
          !disposed &&
          adapter.getPending().get(key) === request &&
          adapter.unwrap(adapter.getOptions().get(key)?.raw) === request.source &&
          children
        ) {
          adapter.addChildren(children, key);
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (adapter.getPending().get(key) === request) adapter.deletePending(key);
      });
  };
  return { dispose, loadOption, isLoading };
}
