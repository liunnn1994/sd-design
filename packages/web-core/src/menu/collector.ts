import type { MenuData, MenuDataItem } from './types.js';

import { isUndefined } from '../_utils/is.js';
export function getMenuKeys(data: MenuData, condition: (item: MenuDataItem) => boolean) {
  const keys: string[] = [];

  const loop = (list: MenuData) => {
    list.forEach((item) => {
      if (condition(item)) {
        keys.push(item.key);
      }
      if (item.children) {
        loop(item.children);
      }
    });
  };

  loop(data);

  return keys;
}

export interface MenuCollectorOptions {
  key?: string | undefined;
  type: 'menu' | 'popupMenu' | 'subMenu';
}
export interface MenuCollectorContext {
  collectSubMenu(key: string, children: MenuData, isReport?: boolean): void;
  removeSubMenu(key: string): void;
  collectMenuItem(key: string): void;
  removeMenuItem(key: string): void;
  reportMenuData(data: MenuData): void;
}
export function createMenuCollector(adapter: {
  readonly options: MenuCollectorOptions;
  readonly data: MenuData;
  readonly parent: Readonly<MenuCollectorContext> | undefined;
  replace(value: MenuData): void;
}) {
  const props = adapter.options;
  const { key, type } = props;
  const context: MenuCollectorContext = {
    collectSubMenu(key, children, isReport = false) {
      const item = {
        key,
        children,
      };
      if (isReport) {
        const oldOne = adapter.data.find((i) => i.key === key);
        if (oldOne) {
          oldOne.children = children;
        } else {
          adapter.data.push(item);
        }
      } else {
        adapter.replace([...adapter.data, item]);
      }

      // 当接收到了更新数据，除了 menu，继续向上更新
      if (isReport) {
        if (type === 'popupMenu') {
          adapter.parent?.reportMenuData(adapter.data);
        } else if (type === 'subMenu' && !isUndefined(props.key)) {
          adapter.parent?.collectSubMenu(props.key, adapter.data, true);
        }
      }
    },
    removeSubMenu(key) {
      adapter.data.splice(
        0,
        adapter.data.length,
        ...adapter.data.filter((item) => item.key !== key),
      );
    },
    collectMenuItem(key) {
      adapter.data.push({ key });
    },
    removeMenuItem(key) {
      adapter.data.splice(
        0,
        adapter.data.length,
        ...adapter.data.filter((item) => item.key !== key),
      );
    },
    reportMenuData(reportData) {
      adapter.replace(reportData);
      // 继续向上更新，注意：只有 popup submenu 会接收到 report
      if (type === 'subMenu' && !isUndefined(key)) {
        adapter.parent?.collectSubMenu(key, adapter.data, true);
      }
    },
  };

  function mount() {
    if (type === 'subMenu' && !isUndefined(key)) adapter.parent?.collectSubMenu(key, adapter.data);
    else if (type === 'popupMenu') adapter.parent?.reportMenuData(adapter.data);
  }
  function unmount() {
    if (type === 'subMenu' && !isUndefined(key)) adapter.parent?.removeSubMenu(key);
  }
  return { context, mount, unmount };
}
