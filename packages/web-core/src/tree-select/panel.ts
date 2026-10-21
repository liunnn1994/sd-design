import type { TreeNodeKey } from '../tree/types.js';

export interface TreeSelectPanelState {
  readonly showCheckable: boolean;
  readonly selectedKeys: TreeNodeKey[] | undefined;
  readonly tree: { toggleCheck?: (key: TreeNodeKey, event: Event) => void } | undefined;
}

export function createTreeSelectPanelFoundation(
  state: TreeSelectPanelState,
  onChange: (keys: TreeNodeKey[]) => void,
) {
  const getSelectionProps = () => ({
    disableSelectActionOnly: true,
    checkedKeys: state.showCheckable ? state.selectedKeys : [],
    selectedKeys: state.showCheckable ? [] : state.selectedKeys,
  });
  const onSelect = (newValue: TreeNodeKey[], event: { readonly e?: Event | undefined }) => {
    if (state.showCheckable) {
      if (newValue[0] !== undefined && event.e) {
        state.tree?.toggleCheck?.(newValue[0], event.e);
      }
    } else {
      onChange(newValue);
    }
  };
  const onCheck = (newValue: TreeNodeKey[]) => {
    onChange(newValue);
  };
  return { getSelectionProps, onSelect, onCheck };
}
