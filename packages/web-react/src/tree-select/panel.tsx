import type { TreeNodeKey } from '@sdata/web-core/tree/types';

import { createTreeSelectPanelFoundation } from '@sdata/web-core/tree-select/panel';
import { useRef } from 'react';

import type { ScrollbarProps } from '../scrollbar/index.js';
import type { TreeNodeData } from '../tree/node.js';
import type { TreeProps, TreeInstance } from '../tree/tree.js';

import { usePrefix } from '../config-provider/index.js';
import { Scrollbar } from '../scrollbar/index.js';
import { Tree } from '../tree/tree.js';

export interface TreeSelectPanelProps<T extends TreeNodeData> {
  treeProps?: TreeProps<T>;
  ellipsis?: TreeProps<T>['ellipsis'];
  selectedKeys?: TreeNodeKey[];
  showCheckable?: boolean;
  scrollbar?: boolean | ScrollbarProps | undefined;
  onChange?(keys: TreeNodeKey[]): void;
}
export function TreeSelectPanel<T extends TreeNodeData>({
  treeProps,
  ellipsis = false,
  selectedKeys,
  showCheckable,
  scrollbar,
  onChange,
}: TreeSelectPanelProps<T>) {
  const tree = useRef<TreeInstance<T>>(null);
  const prefix = usePrefix('tree-select');
  const foundation = createTreeSelectPanelFoundation(
    {
      showCheckable: !!showCheckable,
      selectedKeys,
      get tree() {
        return tree.current ?? undefined;
      },
    },
    (keys) => onChange?.(keys),
  );
  return (
    <Scrollbar
      type="embed"
      {...(typeof scrollbar === 'object' ? scrollbar : {})}
      className={[
        `${prefix}-tree-wrapper`,
        treeProps?.virtualListProps && `${prefix}-tree-wrapper-virtual`,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Tree
        {...treeProps}
        {...foundation.getSelectionProps()}
        ref={tree}
        ellipsis={ellipsis}
        onSelect={foundation.onSelect}
        onCheck={foundation.onCheck}
      />
    </Scrollbar>
  );
}
