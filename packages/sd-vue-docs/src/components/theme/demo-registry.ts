import { defineAsyncComponent, markRaw, type Component } from 'vue';

// 文档示例也是主题预览入口；新增组件无需维护编辑器名单。
const modules = import.meta.glob<{ default: Component }>('../generated/*/*.vue');
const cache = new Map<string, Component>();
export const demoComponents = [
  ...new Set(Object.keys(modules).map((key) => key.split('/').at(-2)!)),
].sort();
export function demosFor(name: string) {
  return Object.keys(modules)
    .filter((key) => key.split('/').at(-2) === name)
    .map((path) => ({ path, name: path.split('/').at(-1)!.replace('.vue', '') }))
    .sort((a, b) =>
      a.name === 'basic' ? -1 : b.name === 'basic' ? 1 : a.name.localeCompare(b.name),
    );
}
export function loadDemo(path: string) {
  if (!modules[path]) return undefined;
  if (!cache.has(path)) cache.set(path, markRaw(defineAsyncComponent(modules[path])));
  return cache.get(path);
}
