import type { CascaderOptionInfo } from './types.js';

export interface CascaderPathAdapter<P> {
  getOptions: () => CascaderOptionInfo<P>[];
  getOptionMap: () => ReadonlyMap<string, CascaderOptionInfo<P>>;
  getActiveKey: () => string | undefined;
  getSelectedPath: () => string[];
  getSearchPanel: () => boolean | undefined;
  getFilteredOptions: () => CascaderOptionInfo<P>[];
  getExpandChild: () => boolean;
  setSelectedPath: (path: string[]) => void;
}
export function createCascaderPath<P>(adapter: CascaderPathAdapter<P>) {
  function activeOption() {
    const key = adapter.getActiveKey();
    return key ? adapter.getOptionMap().get(key) : undefined;
  }
  function displayColumns() {
    const columns = [adapter.getOptions()];
    for (const key of adapter.getSelectedPath()) {
      const option = adapter.getOptionMap().get(key);
      if (option?.children) columns.push(option.children);
    }
    return columns;
  }
  function enabledOptions() {
    if (adapter.getSearchPanel())
      return adapter.getFilteredOptions().filter((item) => !item.disabled);
    const active = activeOption();
    if (active && active.parent) return active.parent.children?.filter((item) => !item.disabled);
    return adapter.getOptions().filter((item) => !item.disabled);
  }
  function setSelectedPath(key?: string) {
    let target = key ? adapter.getOptionMap().get(key) : undefined;
    if (adapter.getExpandChild()) {
      while (target?.children?.length) target = target.children[0];
    }
    adapter.setSelectedPath(target?.path.map((item) => item.key) ?? []);
  }
  function getNextActiveNode(direction: 'next' | 'preview') {
    const enabled = enabledOptions();
    const length = enabled?.length ?? 0;
    const active = adapter.getActiveKey();
    if (active) {
      const index = enabled?.findIndex((item) => item.key === active) ?? 0;
      return enabled?.[(length + index + (direction === 'next' ? 1 : -1)) % length];
    }
    return enabled?.[0];
  }
  return { activeOption, displayColumns, setSelectedPath, getNextActiveNode };
}
