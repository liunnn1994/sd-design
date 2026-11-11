export { TreeSelect, TreeSelect as default } from './tree-select.js';
export type { TreeSelectProps, TreeSelectInstance, TreeSelectTriggerState } from './tree-select.js';
export type {
  TreeSelectValue,
  LabelValue,
  FallbackOption,
} from '@sdata/web-core/tree-select/types';
import type { TreeNodeData } from '../tree/node.js';
import type { TreeSelectProps } from './tree-select.js';

export type TreeSelectChangeHandler<T extends TreeNodeData = TreeNodeData> = NonNullable<
  TreeSelectProps<T>['onChange']
>;
export type TreeSelectClearHandler = NonNullable<TreeSelectProps['onClear']>;
export type TreeSelectFallbackOption<T extends TreeNodeData = TreeNodeData> = NonNullable<
  TreeSelectProps<T>['fallbackOption']
>;
export type TreeSelectFilterTreeNode<T extends TreeNodeData = TreeNodeData> = NonNullable<
  TreeSelectProps<T>['filterTreeNode']
>;
export type TreeSelectLoadMore<T extends TreeNodeData = TreeNodeData> = NonNullable<
  TreeSelectProps<T>['loadMore']
>;
export type TreeSelectPopupVisibleChangeHandler = NonNullable<
  TreeSelectProps['onPopupVisibleChange']
>;
export type TreeSelectSearchHandler = NonNullable<TreeSelectProps['onSearch']>;
