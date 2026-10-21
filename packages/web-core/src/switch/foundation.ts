import { isNull } from '../_utils/is.js';

export type SwitchValue = string | number | boolean;
export type SwitchBeforeChange = (value: SwitchValue) => Promise<boolean | void> | boolean | void;

export interface SwitchAdapter<E> {
  getCheckedValue(): SwitchValue;
  getUncheckedValue(): SwitchValue;
  getModel(): SwitchValue | undefined;
  getInternal(): SwitchValue;
  setInternal(value: SwitchValue): void;
  isDisabled(): boolean;
  isLoading(): boolean;
  isAutoLoading(): boolean;
  hasLoadingProp(): boolean;
  hasModelProp(): boolean;
  getBeforeChange(): SwitchBeforeChange | undefined;
  setBeforeLoading(value: boolean): void;
  setAutoLoading(value: boolean): void;
  onUpdate(value: SwitchValue): void;
  onChange(value: SwitchValue, event: E): void;
  onFormChange(event: E): void;
}

export function createSwitchFoundation<E>(adapter: SwitchAdapter<E>) {
  const isChecked = () =>
    (adapter.getModel() ?? adapter.getInternal()) === adapter.getCheckedValue();
  function change(checked: boolean, event: E) {
    adapter.setInternal(checked ? adapter.getCheckedValue() : adapter.getUncheckedValue());
    if (adapter.isAutoLoading() && !adapter.hasLoadingProp() && adapter.hasModelProp())
      adapter.setAutoLoading(true);
    adapter.onUpdate(adapter.getInternal());
    adapter.onChange(adapter.getInternal(), event);
    adapter.onFormChange(event);
  }
  async function click(event: E) {
    if (adapter.isLoading() || adapter.isDisabled()) return;
    const checked = !isChecked();
    const checkedValue = checked ? adapter.getCheckedValue() : adapter.getUncheckedValue();
    const shouldChange = adapter.getBeforeChange();
    if (typeof shouldChange === 'function') {
      adapter.setBeforeLoading(true);
      try {
        const result = await shouldChange(checkedValue);
        if ((result ?? true) && !adapter.isDisabled()) change(checked, event);
      } catch {
        // A rejected hook blocks the change, matching the existing component contract.
      } finally {
        adapter.setBeforeLoading(false);
      }
    } else change(checked, event);
  }
  function syncModel(value: SwitchValue | null | undefined) {
    if (value === undefined || isNull(value)) adapter.setInternal(adapter.getUncheckedValue());
  }
  const resetAutoLoading = () => adapter.setAutoLoading(false);
  function syncAutoLoading() {
    if (!adapter.isAutoLoading() || adapter.hasLoadingProp() || !adapter.hasModelProp())
      resetAutoLoading();
  }
  return { isChecked, click, syncModel, resetAutoLoading, syncAutoLoading };
}
