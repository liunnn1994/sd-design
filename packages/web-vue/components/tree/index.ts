import type { App } from 'vue';

import type { SDOptions, SFCWithInstall } from '../_utils/types';
import type { TreeProps } from './interface';

import { getComponentPrefix, setGlobalConfig } from '../_utils/global-config';
import _Tree from './tree.vue';

export type {
  CheckedStrategy,
  CheckableType,
  DropPosition,
  FilterTreeNode,
  Key2TreeNode,
  LoadMore,
  TreeFieldNames,
  TreeNodeDomEventName,
  TreeNodeData,
  TreeNodeEventHandler,
  TreeNodeKey,
  TreeNodeSwipeDirection,
  TreeNodeSwipeEventData,
  TreeNodeSwipeEventHandler,
  TreeNodeSwipeEventName,
  TreeProps,
} from './interface';

const Tree = Object.assign(_Tree, {
  install: (app: App, options?: SDOptions) => {
    setGlobalConfig(app, options);
    const componentPrefix = getComponentPrefix(options);

    app.component(componentPrefix + _Tree.name, _Tree);
  },
}) as SFCWithInstall<typeof _Tree>;

export type TreeInstance = InstanceType<typeof _Tree>;
export type TreeSelectHandler = NonNullable<TreeProps['onSelect']>;
export type TreeCheckHandler = NonNullable<TreeProps['onCheck']>;
export type TreeExpandHandler = NonNullable<TreeProps['onExpand']>;
export type TreeDropHandler = NonNullable<TreeProps['onDrop']>;
export type TreeNodeClickHandler = NonNullable<TreeProps['onNodeClick']>;
export type TreeNodeLongPressHandler = NonNullable<TreeProps['onNodeLongPress']>;
export type TreeNodeSwipeHandler = NonNullable<TreeProps['onNodeSwipe']>;

export default Tree;
