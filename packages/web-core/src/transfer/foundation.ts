import type { DataInfo, TransferDirection, TransferItem } from './types.js';

export function getTransferDataInfo<T extends TransferItem>(
  data: T[],
  target: string[],
  selected: string[],
) {
  const sourceInfo: DataInfo<T> = { data: [], allValidValues: [], selected: [], validSelected: [] };
  const targetInfo: DataInfo<T> = { data: [], allValidValues: [], selected: [], validSelected: [] };
  for (const item of data) {
    const info = target.includes(item.value) ? targetInfo : sourceInfo;
    info.data.push(item);
    if (!item.disabled) info.allValidValues.push(item.value);
    if (selected.includes(item.value)) {
      info.selected.push(item.value);
      if (!item.disabled) info.validSelected.push(item.value);
    }
  }
  return { sourceInfo, targetInfo };
}

export interface TransferAdapter {
  getTarget(): string[];
  getDataInfo(): { sourceInfo: DataInfo; targetInfo: DataInfo };
  setTarget(value: string[]): void;
  setSelected(value: string[]): void;
  onUpdateTarget(value: string[]): void;
  onChange(value: string[]): void;
  onFormChange(): void;
  onUpdateSelected(value: string[]): void;
  onSelect(value: string[]): void;
  onSearch(value: string, type: TransferDirection): void;
}

export function createTransferFoundation(adapter: TransferAdapter) {
  function select(values: string[]) {
    adapter.setSelected(values);
    adapter.onUpdateSelected(values);
    adapter.onSelect(values);
  }
  function moveTo(values: string[], target: TransferDirection) {
    const newTarget =
      target === 'target'
        ? [...adapter.getTarget(), ...values]
        : adapter.getTarget().filter((value) => !values.includes(value));
    select(adapter.getDataInfo()[target === 'target' ? 'targetInfo' : 'sourceInfo'].selected);
    adapter.setTarget(newTarget);
    adapter.onUpdateTarget(newTarget);
    adapter.onChange(newTarget);
    adapter.onFormChange();
  }
  function moveSelected(target: TransferDirection) {
    const values =
      adapter.getDataInfo()[target === 'target' ? 'sourceInfo' : 'targetInfo'].validSelected;
    moveTo(values, target);
  }
  const search = (value: string, type: TransferDirection) => adapter.onSearch(value, type);
  return { select, moveTo, moveSelected, search };
}

export interface TransferViewAdapter {
  getDataInfo(): DataInfo;
  getSelected(): string[];
  getFilter(): string;
  isDisabled(): boolean;
  onSelect(value: string[]): void;
  moveTo(values: string[], target: TransferDirection): void;
}

export function createTransferViewFoundation(adapter: TransferViewAdapter) {
  const isChecked = () =>
    adapter.getDataInfo().validSelected.length > 0 &&
    adapter.getDataInfo().validSelected.length === adapter.getDataInfo().allValidValues.length;
  const isIndeterminate = () =>
    adapter.getDataInfo().validSelected.length > 0 &&
    adapter.getDataInfo().validSelected.length < adapter.getDataInfo().allValidValues.length;
  const getFilteredData = () =>
    adapter
      .getDataInfo()
      .data.filter((item) =>
        adapter.getFilter() ? item.label.includes(adapter.getFilter()) : true,
      );
  function selectAll(value: boolean | (string | number | boolean)[]) {
    if (adapter.isDisabled()) return;
    adapter.onSelect(
      value
        ? [...new Set([...adapter.getSelected(), ...adapter.getDataInfo().allValidValues])]
        : adapter
            .getSelected()
            .filter((value) => !adapter.getDataInfo().allValidValues.includes(value)),
    );
  }
  function clear() {
    if (adapter.isDisabled()) return;
    adapter.moveTo(adapter.getDataInfo().allValidValues, 'source');
  }
  return { isChecked, isIndeterminate, getFilteredData, selectAll, clear };
}

export interface TransferItemAdapter {
  isSimple(): boolean;
  isDisabled(): boolean;
  getValue(): string;
  getType(): TransferDirection | undefined;
  moveTo(values: string[], target: TransferDirection): void;
  onSelect(values: string[]): void;
}

export function createTransferItemFoundation(adapter: TransferItemAdapter) {
  function click() {
    if (adapter.isSimple() && !adapter.isDisabled())
      adapter.moveTo([adapter.getValue()], adapter.getType() === 'target' ? 'source' : 'target');
  }
  const change = (value: unknown) => adapter.onSelect(value as string[]);
  const remove = () => adapter.moveTo([adapter.getValue()], 'source');
  return { click, change, remove };
}
