import type { TreeModelNode, TreeNodeKey } from '@sdata/web-core/tree/types';
import type { RefObject } from 'react';

import { getActiveTreeKey, getTreeKeyAction } from '@sdata/web-core/tree/keyboard';
import { useLayoutEffect, useReducer, useRef, useState } from 'react';

import type { TreeNodeData } from './node.js';
import type { useTreeState } from './use-tree-state.js';

export function useTreeKeyboard<T extends TreeNodeData>(options: {
  root: RefObject<HTMLElement | null>;
  visibleNodes: TreeModelNode<T>[];
  state: ReturnType<typeof useTreeState<T, Event>>;
  canLoadMore: boolean;
  scrollToKey?(key: TreeNodeKey): void;
}) {
  const [active, setActive] = useState<TreeNodeKey>();
  const [, render] = useReducer((value: number) => value + 1, 0);
  const pending = useRef<TreeNodeKey | undefined>(undefined);
  const activeKey = getActiveTreeKey(active, options.state.selectedKeys, options.visibleNodes);
  const focusPendingNode = () => {
    if (pending.current === undefined) return;
    const element = options.root.current?.querySelector<HTMLElement>(
      `[data-key="${CSS.escape(String(pending.current))}"][data-key-type="${typeof pending.current}"]`,
    );
    if (element) {
      element.focus();
      if (element.ownerDocument.activeElement === element) pending.current = undefined;
    }
  };
  useLayoutEffect(focusPendingNode);
  const focusNodeKey = (key: TreeNodeKey) => {
    setActive(key);
    pending.current = key;
    options.scrollToKey?.(key);
    render();
  };
  const onNodeKeydown = (key: TreeNodeKey, event: KeyboardEvent) => {
    if (event.defaultPrevented || event.isComposing) return;
    const action = getTreeKeyAction({
      key,
      eventKey: event.key,
      visibleNodes: options.visibleNodes,
      expandedKeys: options.state.expandedKeys,
      canLoadMore: options.canLoadMore,
    });
    if (!action) return;
    event.preventDefault();
    const { foundation } = options.state;
    switch (action.type) {
      case 'focus':
        focusNodeKey(action.key);
        break;
      case 'load':
        void foundation.loadMore(action.key);
        break;
      case 'expand':
        foundation.expand(action.expanded, action.key, event);
        break;
      case 'check':
        foundation.toggleCheck(action.key, event);
        break;
      case 'select':
        foundation.select(action.key, event);
        break;
    }
  };
  return { activeKey, focusNodeKey, focusPendingNode, onNodeKeydown };
}
