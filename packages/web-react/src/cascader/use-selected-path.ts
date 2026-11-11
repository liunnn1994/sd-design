import type { CascaderOptionInfo } from '@sdata/web-core/cascader/types';

import { createCascaderPath } from '@sdata/web-core/cascader/navigation';
import { useReducer, useRef, useState } from 'react';

export function useCascaderSelectedPath<P>(props: {
  options: CascaderOptionInfo<P>[];
  optionMap: ReadonlyMap<string, CascaderOptionInfo<P>>;
  filteredOptions: CascaderOptionInfo<P>[];
  showSearchPanel?: boolean;
  expandChild: boolean;
}) {
  const current = useRef(props);
  current.current = props;
  const state = useRef({
    activeKey: undefined as string | undefined,
    selectedPath: [] as string[],
  });
  const [, render] = useReducer((version: number) => version + 1, 0);
  const [foundation] = useState(() =>
    createCascaderPath<P>({
      getOptions: () => current.current.options,
      getOptionMap: () => current.current.optionMap,
      getActiveKey: () => state.current.activeKey,
      getSelectedPath: () => state.current.selectedPath,
      getSearchPanel: () => current.current.showSearchPanel,
      getFilteredOptions: () => current.current.filteredOptions,
      getExpandChild: () => current.current.expandChild,
      setSelectedPath: (path) => {
        state.current.selectedPath = path;
        render();
      },
    }),
  );
  return {
    activeKey: state.current.activeKey,
    selectedPath: state.current.selectedPath,
    activeOption: foundation.activeOption(),
    displayColumns: foundation.displayColumns(),
    setActiveKey: (key?: string) => {
      state.current.activeKey = key;
      render();
    },
    setSelectedPath: foundation.setSelectedPath,
    getNextActiveNode: foundation.getNextActiveNode,
  };
}
