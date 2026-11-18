import type { RowKey } from './selection.js';

export interface TableDragState {
  dragging: boolean;
  committing: boolean;
  sourceKey: RowKey | undefined;
  sourcePath: number[];
  targetPath: number[];
  dropAfter: boolean;
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
  function over(path: number[], y?: number, rect?: Pick<DOMRect, 'top' | 'height'>) {
    const source = state.sourcePath;
    const targetPath =
      path.length === source.length &&
      path.slice(0, -1).toString() === source.slice(0, -1).toString()
        ? path
        : [];
    const offset = y !== undefined && rect ? y - Math.floor(rect.top + rect.height / 2) : 0;
    const dropAfter = offset ? offset > 0 : (path.at(-1) ?? -1) > (source.at(-1) ?? -1);
    if (targetPath.toString() === state.targetPath.toString() && dropAfter === state.dropAfter)
      return false;
    state.targetPath = targetPath;
    state.dropAfter = dropAfter;
    return true;
  }
  function end(cancelled: boolean) {
    if (
      !cancelled &&
      adapter.draggable &&
      state.dragging &&
      state.targetPath.length &&
      state.targetPath.toString() !== state.sourcePath.toString()
    ) {
      const source = state.sourcePath.at(-1)!;
      const target = state.targetPath.at(-1)!;
      const index = target + Number(state.dropAfter) - Number(source < target);
      if (index !== source) {
        state.targetPath = [...state.targetPath.slice(0, -1), index];
        state.committing = true;
        adapter.onChange();
      }
    }
    state.committing = false;
    state.dragging = false;
    state.sourceKey = undefined;
    state.sourcePath = [];
    state.targetPath = [];
    state.dropAfter = false;
    state.data = {};
  }
  return { recordAtPath, start, over, end };
}
