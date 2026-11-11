import type { CascaderLoader, CascaderLoadRequest } from '@sdata/web-core/cascader/lazy-load';
import type { CascaderOption, CascaderOptionInfo } from '@sdata/web-core/cascader/types';

import { createCascaderLazyLoad } from '@sdata/web-core/cascader/lazy-load';
import { useLayoutEffect, useReducer, useRef } from 'react';

export function useCascaderLazyLoad<P>(
  loader: CascaderLoader<P> | undefined,
  options: ReadonlyMap<string, CascaderOptionInfo<P>>,
  addChildren: (children: CascaderOption<P>[], key: string) => void,
) {
  const current = useRef({ loader, options, addChildren });
  current.current = { loader, options, addChildren };
  const pending = useRef(new Map<string, CascaderLoadRequest<P>>());
  const foundation = useRef<ReturnType<typeof createCascaderLazyLoad<P>> | null>(null);
  const [, render] = useReducer((version: number) => version + 1, 0);
  useLayoutEffect(() => {
    // Disposed foundations cannot be reused after StrictMode's effect replay.
    const instance = createCascaderLazyLoad<P>({
      getLoader: () => current.current.loader,
      getOptions: () => current.current.options,
      getPending: () => pending.current,
      setPending: (key, request) => {
        pending.current.set(key, request);
        render();
      },
      deletePending: (key) => {
        pending.current.delete(key);
        render();
      },
      clearPending: () => pending.current.clear(),
      unwrap: (value) => value,
      addChildren: (children, key) => current.current.addChildren(children, key),
    });
    foundation.current = instance;
    return () => {
      instance.dispose();
      foundation.current = null;
    };
  }, []);
  return {
    loadOption: (option: CascaderOptionInfo<P>) => foundation.current?.loadOption(option),
    isLoading: (option: CascaderOptionInfo<P>) => foundation.current?.isLoading(option) ?? false,
  };
}
