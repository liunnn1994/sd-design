import { computed, type ComputedRef, type Ref, ref } from 'vue';

import { createCascaderPath } from '@sdata/web-core/cascader/navigation';

import type { TagProps } from '../../tag';
import type { CascaderOptionInfo } from '../interface';

export const useSelectedPath = (
  options: Ref<CascaderOptionInfo[]>,
  config: {
    optionMap: Map<string, CascaderOptionInfo>;
    filteredLeafOptions: ComputedRef<CascaderOptionInfo[]>;
    showSearchPanel?: ComputedRef<boolean>;
    expandChild: Ref<boolean>;
  },
) => {
  const activeKey = ref<string>();
  const selectedPath = ref<string[]>([]);
  const foundation = createCascaderPath<TagProps>({
    getOptions: () => options.value,
    getOptionMap: () => config.optionMap,
    getActiveKey: () => activeKey.value,
    getSelectedPath: () => selectedPath.value,
    getSearchPanel: () => config.showSearchPanel?.value,
    getFilteredOptions: () => config.filteredLeafOptions.value,
    getExpandChild: () => config.expandChild.value,
    setSelectedPath: (path) => {
      selectedPath.value = path;
    },
  });
  return {
    activeKey,
    activeOption: computed<CascaderOptionInfo | undefined>(foundation.activeOption),
    selectedPath,
    displayColumns: computed<CascaderOptionInfo[][]>(foundation.displayColumns),
    setActiveKey: (key?: string) => {
      activeKey.value = key;
    },
    setSelectedPath: foundation.setSelectedPath,
    getNextActiveNode: (direction: 'next' | 'preview'): CascaderOptionInfo | undefined =>
      foundation.getNextActiveNode(direction),
  };
};
