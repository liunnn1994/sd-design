import type { RowKey } from './selection.js';

export interface TableDragState {
  dragging: boolean;
  committing: boolean;
  sourceKey: RowKey | undefined;
  sourcePath: number[];
  targetPath: number[];
  data: Record<string, unknown>;
}
export function createTableDragFoundation<
  Row extends {
    key: RowKey;
    raw: Record<string, unknown>;
    children?: Row[];
  },
>(
  state: TableDragState,
  adapter: {
    readonly draggable: unknown;
    readonly sortedData: Row[];
    onChange: () => void;
  },
) {
  function recordAtPath(path: number[]) {
    let records = adapter.sortedData;
    let record: Row | undefined;
    for (const index of path) {
      record = records[index];
      records = record?.children ?? [];
    }
    return record;
  }
  function start(path: number[]) {
    const record = recordAtPath(path);
    if (!adapter.draggable || !record) return;
    state.dragging = true;
    state.sourceKey = record.key;
    state.sourcePath = path;
    state.targetPath = [];
    state.data = record.raw;
  }
  function over(path: number[]) {
    const source = state.sourcePath;
    state.targetPath =
      path.length === source.length &&
      path.slice(0, -1).toString() === source.slice(0, -1).toString()
        ? path
        : [];
  }
  function end(cancelled: boolean) {
    if (
      !cancelled &&
      adapter.draggable &&
      state.dragging &&
      state.targetPath.length &&
      state.targetPath.toString() !== state.sourcePath.toString()
    ) {
      state.committing = true;
      adapter.onChange();
    }
    state.committing = false;
    state.dragging = false;
    state.sourceKey = undefined;
    state.sourcePath = [];
    state.targetPath = [];
    state.data = {};
  }
  return { recordAtPath, start, over, end };
}
