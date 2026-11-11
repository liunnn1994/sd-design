import type { TreeDragAdapter, TreeDragState } from '@sdata/web-core/tree/drag';
import type { TreeModelNode, TreeNodeKey } from '@sdata/web-core/tree/types';

import { createDragSort } from '@sdata/web-core/drag-sort/index';
import { createTreeDragFoundation } from '@sdata/web-core/tree/drag';
import { useLayoutEffect, useReducer, useRef, useState } from 'react';

import type { TreeNodeData } from './node.js';

import { usePrefix } from '../config-provider/index.js';

export function useTreeDrag<T extends TreeNodeData>(options: {
  root: HTMLElement | null;
  nodes: Map<TreeNodeKey, TreeModelNode<T>>;
  allowDrop?: TreeDragAdapter<T, TreeModelNode<T>, DragEvent>['allowDrop']['value'];
  events?: Partial<TreeDragAdapter<T, TreeModelNode<T>, DragEvent>['events']>;
}) {
  const prefix = usePrefix('tree-node');
  const current = useRef(options);
  current.current = options;
  const [, render] = useReducer((value: number) => value + 1, 0);
  const [state] = useState<TreeDragState>(() => ({
    sourceKey: undefined,
    targetKey: undefined,
    position: 0,
    allowed: false,
  }));
  const [dragNode] = useState<{ value: TreeModelNode<T> | undefined }>(() => ({
    value: undefined,
  }));
  const [foundation] = useState(() =>
    createTreeDragFoundation<T, TreeModelNode<T>, DragEvent>({
      state,
      dragNode,
      getNodes: () => current.current.nodes,
      allowDrop: {
        get value() {
          return current.current.allowDrop;
        },
      },
      events: {
        start: (...args) => current.current.events?.start?.(...args),
        end: (...args) => current.current.events?.end?.(...args),
        over: (...args) => current.current.events?.over?.(...args),
        leave: (...args) => current.current.events?.leave?.(...args),
        drop: (...args) => current.current.events?.drop?.(...args),
      },
    }),
  );
  useLayoutEffect(() => {
    if (!options.root) return;
    const getNode = (element: HTMLElement) =>
      current.current.nodes.get(
        element.dataset.keyType === 'number' ? Number(element.dataset.key) : element.dataset.key!,
      );
    const driver = createDragSort(options.root, {
      draggable: '[data-tree-draggable]',
      handle: `.${prefix}-title-draggable`,
      onStart(element, event) {
        foundation.start(getNode(element), event);
        render();
      },
      onOver(element, event) {
        foundation.over(
          element ? getNode(element) : undefined,
          event,
          element
            ? () => {
                const title = element.querySelector(`.${prefix}-title`);
                const rect = (title ?? element).getBoundingClientRect();
                return { offset: event.clientY - rect.top, height: rect.height };
              }
            : undefined,
        );
        render();
      },
      onEnd(event, cancelled) {
        foundation.end(event, cancelled);
        render();
      },
    });
    return () => {
      driver.destroy();
      dragNode.value = undefined;
      state.sourceKey = undefined;
      state.targetKey = undefined;
      state.allowed = false;
      state.position = 0;
    };
  }, [options.root, prefix, foundation, dragNode, state]);
  return state;
}
