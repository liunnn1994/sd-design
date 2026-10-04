import { CSSProperties } from 'vue';

import type { FitWidthProps } from '../_hooks/use-fit-width';

import { VirtualListProps } from '../_components/virtual-list/interface';
import { Size } from '../_utils/constant';
import {
  TreeFieldNames,
  TreeNodeData,
  TreeProps,
  TreeNodeKey,
  LoadMore,
  CheckedStrategy,
} from '../tree/interface';
import { TriggerProps } from '../trigger';

export interface LabelValue {
  value: TreeNodeKey;
  label: string | number;
}

export type TreeSelectValue = TreeNodeKey | TreeNodeKey[] | LabelValue | LabelValue[];

export interface TreeSelectTriggerSlotProps {
  value: TreeSelectValue | undefined;
  displayValue: string | string[];
  inputValue: string;
  selectedOptions: TreeNodeData[];
  popupVisible: boolean;
  disabled: boolean;
  loading: boolean;
  multiple: boolean;
}

export type FilterTreeNode = (searchKey: string, nodeData: TreeNodeData) => boolean;

export type FallbackOption = boolean | ((key: TreeNodeKey) => TreeNodeData | boolean);

export type ChangeHandler = (selectedValue: TreeSelectValue | undefined) => void;

export type PopupVisibleChangeHandler = (popupVisible: boolean) => void;

export type SearchHandler = (searchKey: string) => void;

export type ClearHandler = () => void;

export interface TreeSelectProps extends FitWidthProps {
  disabled: boolean;
  loading: boolean;
  error: boolean;
  size: Size;
  border: boolean;
  allowSearch: boolean | { retainInputValue?: boolean } | undefined;
  filterable: boolean | undefined;
  allowClear: boolean;
  clearable: boolean | undefined;
  /**
   * @zh 是否显示下拉箭头
   * @en Whether to show the dropdown arrow
   */
  /**
   * @zh 是否显示下拉箭头
   * @en Whether to show the dropdown arrow
   */
  showArrow: boolean;
  placeholder: string | undefined;
  maxTagCount: number | 'responsive' | undefined;
  defaultValue: TreeSelectValue | undefined;
  modelValue: TreeSelectValue | undefined;
  /**
   * @zh 绑定值（受控）
   * @en Bound value (controlled)
   */
  /**
   * @zh 绑定值（受控）
   * @en Bound value (controlled)
   */
  value: TreeSelectValue | undefined;
  multiple: boolean;
  fieldNames: TreeFieldNames | undefined;
  data: TreeNodeData[];
  options: TreeNodeData[] | undefined;
  ellipsis: TreeProps['ellipsis'] | undefined;
  labelInValue: boolean;
  treeCheckable: boolean;
  checkable: boolean | undefined;
  treeCheckStrictly: boolean;
  treeCheckedStrategy: CheckedStrategy;
  checkStrategy: CheckedStrategy | undefined;
  showPath: boolean;
  separator: string;
  treeProps: Partial<TreeProps> | undefined;
  virtualListProps: VirtualListProps | undefined;
  triggerProps: Partial<TriggerProps> | undefined;
  virtualScroll: boolean | undefined;
  popupVisible: boolean | undefined;
  defaultPopupVisible: boolean;
  /**
   * @zh 是否显示下拉浮层（受控）
   * @en Whether the dropdown popup is shown (controlled)
   */
  /**
   * @zh 是否显示下拉浮层（受控）
   * @en Whether the dropdown popup is shown (controlled)
   */
  show: boolean | undefined;
  /**
   * @zh 是否默认显示下拉浮层（非受控状态）
   * @en Whether the dropdown popup is shown by default (uncontrolled state)
   */
  /**
   * @zh 是否默认显示下拉浮层（非受控状态）
   * @en Whether the dropdown popup is shown by default (uncontrolled state)
   */
  defaultShow: boolean | undefined;
  dropdownStyle: CSSProperties | undefined;
  dropdownClassName: string | string[] | undefined;
  filterTreeNode: FilterTreeNode | undefined;
  loadMore: LoadMore | undefined;
  disableFilter: boolean;
  popupContainer?: string | HTMLElement;
  fallbackOption: FallbackOption;
  showHeaderOnEmpty?: boolean;
  showFooterOnEmpty?: boolean;
}
