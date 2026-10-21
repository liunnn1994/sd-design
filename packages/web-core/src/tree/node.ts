import type { TreeNodeKey } from './types.js';

import { isFunction } from '../_utils/is.js';
import { toArray } from '../_utils/to-array.js';
export type TreeNodeDomEventName =
  | 'click'
  | 'dblclick'
  | 'contextmenu'
  | 'mouseover'
  | 'mouseenter'
  | 'mouseleave'
  | 'mousemove'
  | 'mouseout'
  | 'mousedown'
  | 'mouseup'
  | 'pointerdown'
  | 'pointermove'
  | 'pointerup'
  | 'pointerenter'
  | 'pointerleave'
  | 'pointerover'
  | 'pointerout'
  | 'pointercancel'
  | 'touchstart'
  | 'touchmove'
  | 'touchend'
  | 'touchcancel'
  | 'keydown'
  | 'keyup'
  | 'keypress';

export interface TreeNodeState {
  readonly key: TreeNodeKey;
  readonly isLeaf: boolean | undefined;
  readonly children: readonly unknown[] | undefined;
  readonly expanded: boolean | undefined;
  readonly disableCheckbox: boolean | undefined;
  readonly disabled: boolean | undefined;
  readonly selectable: boolean | undefined;
  readonly actionOnNodeClick: readonly string[];
}
export interface TreeNodeContext {
  treeProps: { actionOnNodeClick?: 'expand' | 'expand'[] };
  checkedKeys: TreeNodeKey[];
  indeterminateKeys: TreeNodeKey[];
  selectedKeys: TreeNodeKey[];
  expandedKeys: TreeNodeKey[];
  loadingKeys: TreeNodeKey[];
  onLoadMore: (key: TreeNodeKey) => void;
  onCheck: (checked: boolean, key: TreeNodeKey, event?: Event) => void;
  onSelect: (key: TreeNodeKey, event: Event) => void;
  onExpand: (expanded: boolean, key: TreeNodeKey, event?: Event) => void;
  onNodeEvent: (name: TreeNodeDomEventName, key: TreeNodeKey, event: Event) => void;
  onNodeKeydown: (key: TreeNodeKey, event: KeyboardEvent) => void;
}
export function createTreeNodeFoundation(state: TreeNodeState, context: Partial<TreeNodeContext>) {
  const getActionOnNodeClick = () => {
    const action = context.treeProps?.actionOnNodeClick;
    return action ? toArray(action) : [];
  };
  const getChecked = () => context.checkedKeys?.includes?.(state.key);
  const getIndeterminate = () => context.indeterminateKeys?.includes?.(state.key);
  const getSelected = () => context.selectedKeys?.includes?.(state.key);
  const getExpanded = () => context.expandedKeys?.includes?.(state.key);
  const getLoading = () => context.loadingKeys?.includes?.(state.key);
  function onSwitcherClick(e: Event) {
    if (state.isLeaf) return;
    if (!state.children?.length && isFunction(context.onLoadMore)) {
      context.onLoadMore(state.key);
    } else {
      context?.onExpand?.(!state.expanded, state.key, e);
    }
  }

  function onCheckboxChange(value: boolean | (string | number | boolean)[], e: Event) {
    if (state.disableCheckbox || state.disabled) {
      return;
    }

    if (Array.isArray(value)) {
      return;
    }

    context.onCheck?.(value, state.key, e);
  }
  function onTitleClick(e: Event) {
    onNodeDomEvent('click', e);
    if (state.actionOnNodeClick.includes('expand')) {
      onSwitcherClick(e);
    }
    if (!state.selectable || state.disabled) return;
    context.onSelect?.(state.key, e);
  }
  function onNodeDomEvent(eventName: TreeNodeDomEventName, e: Event) {
    context.onNodeEvent?.(eventName, state.key, e);
  }
  // treeitem 级键盘事件：保留对外 nodeKeydown 事件 + WAI-ARIA tree 方向键导航
  function onTreeitemKeydown(e: KeyboardEvent) {
    onNodeDomEvent('keydown', e);
    context.onNodeKeydown?.(state.key, e);
  }
  return {
    getActionOnNodeClick,
    getChecked,
    getIndeterminate,
    getSelected,
    getExpanded,
    getLoading,
    onSwitcherClick,
    onCheckboxChange,
    onTitleClick,
    onNodeDomEvent,
    onTreeitemKeydown,
  };
}
