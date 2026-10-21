import type { KvListItem, KvListWorkingItem } from './types.js';

import { isSameKvList, normalizeKvList, parseBulkKvList, stringifyKvList } from './utils.js';

export interface KvListState {
  rows: KvListWorkingItem[];
  json: KvListItem[];
  bulk: string;
  readonly disabled: boolean;
}

export function createKvListFoundation(state: KvListState) {
  let id = 0;
  let suppressedJsonUpdate: KvListItem[] | undefined;

  function createWorkingItem(item: KvListItem): KvListWorkingItem {
    return { id: id++, key: item.key, value: item.value };
  }

  function publicRows() {
    return normalizeKvList(state.rows);
  }

  function replaceRows(items: readonly KvListItem[]) {
    const normalizedItems = normalizeKvList(items);
    state.rows =
      normalizedItems.length > 0
        ? normalizedItems.map(createWorkingItem)
        : [createWorkingItem({ key: '', value: '' })];
  }

  function commitRows() {
    const items = publicRows();
    const bulk = stringifyKvList(items);

    if (!isSameKvList(normalizeKvList(state.json), items)) {
      state.json = items;
    }
    if (state.bulk !== bulk) {
      state.bulk = bulk;
    }
  }

  function addItem() {
    if (state.disabled) return;
    state.rows.push(createWorkingItem({ key: '', value: '' }));
    // 空键行仍会被 normalizeKvList 过滤，commit 仅用于保持两个模型与行列表一致
    commitRows();
  }

  function updateItem(index: number, item: KvListWorkingItem) {
    if (state.disabled) return;
    state.rows[index] = item;
    commitRows();
  }

  function removeItem(index: number) {
    if (state.disabled) return;
    state.rows.splice(index, 1);
    if (state.rows.length === 0) {
      addItem();
    }
    commitRows();
  }

  function clearItems() {
    if (state.disabled) return;
    replaceRows([]);
    commitRows();
  }

  function initialize() {
    const initialJson = normalizeKvList(state.json);
    const initialBulk = parseBulkKvList(state.bulk);

    if (initialJson.length > 0) {
      replaceRows(initialJson);
      state.bulk = stringifyKvList(initialJson);
    } else if (initialBulk.length > 0) {
      replaceRows(initialBulk);
      state.json = initialBulk;
    } else {
      replaceRows([]);
    }
  }
  function moveItem(from: number, to: number) {
    const next = [...state.rows];
    next.splice(to, 0, ...next.splice(from, 1));
    state.rows = next;
    commitRows();
  }
  function syncJson(value: KvListItem[]) {
    const items = normalizeKvList(value);

    if (suppressedJsonUpdate && isSameKvList(items, suppressedJsonUpdate)) {
      suppressedJsonUpdate = undefined;
      return;
    }
    if (isSameKvList(items, publicRows())) return;

    replaceRows(items);
    const bulk = stringifyKvList(items);
    if (state.bulk !== bulk) {
      state.bulk = bulk;
    }
  }
  function syncBulk(value: string) {
    if (value === stringifyKvList(publicRows())) return;

    const items = parseBulkKvList(value);
    if (isSameKvList(items, publicRows())) return;

    replaceRows(items);
    if (!isSameKvList(items, normalizeKvList(state.json))) {
      suppressedJsonUpdate = items;
      state.json = items;
    }
  }
  return { initialize, addItem, updateItem, removeItem, clearItems, moveItem, syncJson, syncBulk };
}
