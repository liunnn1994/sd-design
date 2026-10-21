import type { MenuData } from './types.js';

import { isUndefined } from '../_utils/is.js';
export interface MenuOpenStateProps {
  modelValue: string[] | undefined;
  defaultValue: string[] | undefined;
  autoOpen: boolean;
  autoOpenSelected: boolean;
  selectedKeys: string[];
  subMenuKeys: string[];
  menuData: MenuData;
  accordion: boolean;
}

function getPath(data: MenuData, key: string) {
  const path: string[] = [];
  const loop = (list: MenuData) => {
    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      if (item.key === key) {
        return true;
      }
      if (item.children) {
        path.push(item.key);
        const matched = loop(item.children);
        if (matched) {
          return true;
        }
        path.pop();
      }
    }
    return false;
  };

  loop(data);

  return path;
}

function isSameKeys(keys1: string[], keys2: string[]) {
  if (keys1.length !== keys2.length) return false;
  return keys1.toString() === keys2.toString();
}

export function initialMenuOpenValue(props: MenuOpenStateProps) {
  return !isUndefined(props.modelValue)
    ? props.modelValue
    : !isUndefined(props.defaultValue)
      ? props.defaultValue
      : [];
}
export function createMenuOpenFoundation(adapter: {
  readonly props: MenuOpenStateProps;
  readonly openKeys: string[];
  setLocal(value: string[]): void;
}) {
  let mountedSubMenuKeys: string[] = [];
  function mount() {
    mountedSubMenuKeys = [...adapter.props.subMenuKeys];
    let newOpenKeys: string[] = [];
    if (adapter.props.autoOpen) {
      newOpenKeys = adapter.props.accordion
        ? adapter.props.subMenuKeys.slice(0, 1)
        : [...adapter.props.subMenuKeys];
    }
    if (adapter.props.autoOpenSelected) {
      const pathList = adapter.props.selectedKeys.map((key) =>
        getPath(adapter.props.menuData, key),
      );
      if (pathList.length && (!adapter.props.autoOpen || adapter.props.accordion)) {
        newOpenKeys = adapter.props.accordion
          ? pathList[0]
          : [...new Set(([] as string[]).concat(...pathList))];
      }
    }
    if (newOpenKeys.length) {
      adapter.setLocal(newOpenKeys);
    }
  }

  let hasTriggered = false;
  function syncKeys(currentKeys: string[], prevKeys: string[] = []) {
    if (hasTriggered || !isSameKeys(currentKeys, mountedSubMenuKeys)) {
      const newOpenKeys = adapter.openKeys.filter((key) => currentKeys.includes(key));
      if (adapter.props.autoOpen) {
        const keysAdded = currentKeys.filter((key) => !prevKeys.includes(key));
        newOpenKeys.push(...keysAdded);
      }
      adapter.setLocal(adapter.props.accordion ? newOpenKeys.slice(0, 1) : newOpenKeys);
    }
    hasTriggered = true;
  }

  function open(key: string, level: number) {
    let newOpenKeys: string[] = [];
    if (adapter.openKeys.indexOf(key) > -1) {
      if (adapter.props.accordion && level === 1) {
        newOpenKeys = [];
      } else {
        newOpenKeys = adapter.openKeys.filter((i) => i !== key);
      }
    } else if (adapter.props.accordion && level === 1) {
      newOpenKeys = [key];
    } else {
      newOpenKeys = adapter.openKeys.concat([key]);
    }
    adapter.setLocal(newOpenKeys);
    return newOpenKeys;
  }
  function syncModel(value: string[] | undefined) {
    if (isUndefined(value)) adapter.setLocal([]);
  }
  return { mount, syncKeys, syncModel, open };
}
