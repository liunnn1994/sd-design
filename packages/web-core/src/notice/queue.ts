import type { NoticeConfig, NoticeId, NoticeItem } from './types.js';

import { isFunction, isUndefined } from '../_utils/is.js';

export function createNoticeQueue<Config extends NoticeConfig, Item extends NoticeItem>(
  kind: 'message' | 'notification',
  adapter: {
    readonly items: Item[];
    readonly alive: boolean;
    readonly connected: boolean;
    create(config: Config & { id: NoticeId }): Item;
    destroy(): void;
    onDestroy(): void;
  },
) {
  const pool = new Set<Item>();
  const ids = new Set<NoticeId>();
  let count = 0;
  function remove(id: NoticeId) {
    for (let i = 0; i < adapter.items.length; i++) {
      const item = adapter.items[i];
      if (item.id === id) {
        adapter.items.splice(i, 1);
        ids.delete(id);
        pool.delete(item);
        if (isFunction(item.onClose)) item.onClose(id);
        break;
      }
    }
  }
  function update(id: NoticeId, config: Config) {
    for (let i = 0; i < adapter.items.length; i++) {
      if (adapter.items[i].id === id) {
        const item = adapter.items[i];
        const resetOnUpdate =
          kind === 'notification'
            ? (config.resetOnUpdate ?? item.resetOnUpdate ?? !isUndefined(config.duration))
            : !isUndefined(config.duration);
        Object.assign(item, { ...config, id, resetOnUpdate });
        const updated = adapter.items[i];
        if (config.deduplicate) pool.add(updated);
        else pool.delete(updated);
        break;
      }
    }
    return { close: () => remove(id) };
  }
  function add(config: Config) {
    count++;
    let id = config.id ?? `__sd_${kind}_${count}`;
    if (isUndefined(config.id)) {
      while (ids.has(id)) id = `__sd_${kind}_${++count}`;
    }
    if (ids.has(id)) return update(id, config);
    const item = adapter.create({ ...config, id });
    adapter.items.push(item);
    if (config.deduplicate) pool.add(item);
    ids.add(id);
    return { close: () => remove(id) };
  }
  function reuse(config: Config) {
    for (const item of pool) {
      if (
        (!config.deduplicateByType || item.type === config.type) &&
        item.content === config.content &&
        (kind === 'message' || item.title === config.title)
      ) {
        if (!isUndefined(config.duration)) item.duration = config.duration;
        item.timerVersion = (item.timerVersion ?? 0) + 1;
        return { close: () => remove(item.id) };
      }
    }
  }
  function clear() {
    adapter.items.splice(0);
    ids.clear();
    pool.clear();
  }
  function destroy() {
    if (adapter.items.length === 0 && adapter.alive) {
      adapter.destroy();
      adapter.onDestroy();
    }
  }
  return { add, reuse, update, remove, clear, destroy, isDisconnected: () => !adapter.connected };
}
