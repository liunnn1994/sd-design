export type TreeNodeKey = string | number;

/** Only the data required by linked selection; render content stays in adapters. */
export interface CheckNode {
  key: TreeNodeKey;
  disabled?: boolean;
  disableCheckbox?: boolean;
  checkable?: boolean;
  parent?: CheckNode;
  children?: CheckNode[];
}

export interface TreeFieldNames {
  /**
   * @zh 指定 key 在 TreeNodeData 中的字段名
   * @en Specify the field name of key in TreeNodeData
   * @defaultValue key
   */
  key?: string;
  /**
   * @zh 指定 title 在 TreeNodeData 中的字段名
   * @en Specify the field name of title in TreeNodeData
   * @defaultValue title
   */
  title?: string;
  /**
   * @zh 指定 disabled 在 TreeNodeData 中的字段名
   * @en Specify the field name of disabled in TreeNodeData
   * @defaultValue disabled
   */
  disabled?: string;
  /**
   * @zh 指定 children 在 TreeNodeData 中的字段名
   * @en Specify the field name of children in TreeNodeData
   * @defaultValue children
   */
  children?: string;
  /**
   * @zh 指定 isLeaf 在 TreeNodeData 中的字段名
   * @en Specify the field name of isLeaf in TreeNodeData
   * @defaultValue isLeaf
   */
  isLeaf?: string;
  /**
   * @zh 指定 disableCheckbox 在 TreeNodeData 中的字段名
   * @en Specify the field name of disableCheckbox in TreeNodeData
   * @defaultValue disableCheckbox
   */
  disableCheckbox?: string;
  /**
   * @zh 指定 checkable 在 TreeNodeData 中的字段名
   * @en Specify the field name of checkable in TreeNodeData
   * @defaultValue checkable
   */
  checkable?: string;
  /**
   * @zh 指定 icon 在 TreeNodeData 中的字段名
   * @en Specify the field name of icon in TreeNodeData
   * @defaultValue icon
   */
  icon?: string;

  [field: string]: string | undefined;
}

/** Render-specific fields are opaque payload owned by a framework adapter. */
export interface TreeData {
  key?: TreeNodeKey;
  title?: unknown;
  selectable?: boolean;
  disabled?: boolean;
  disableCheckbox?: boolean;
  checkable?: boolean;
  draggable?: boolean;
  isLeaf?: boolean;
  children?: TreeData[];
  [field: string]: unknown;
}
export type TreeCheckable<T extends TreeData = TreeData> =
  | boolean
  | ((node: T, info: { level: number; isLeaf: boolean }) => boolean);
export type TreeNodeProps<T extends TreeData = TreeData> = Omit<T, 'children'> & {
  key: TreeNodeKey;
  selectable: boolean;
  disabled: boolean;
  disableCheckbox: boolean;
  checkable: boolean;
  draggable: boolean;
  isLeaf: boolean;
  isTail: boolean;
  blockNode: boolean;
  showLine: boolean;
  level: number;
  lineless: boolean[];
};
export type TreeModelNode<T extends TreeData = TreeData> = TreeNodeProps<T> & {
  treeNodeProps: TreeNodeProps<T>;
  treeNodeData: T;
  parent?: TreeModelNode<T>;
  parentKey?: TreeNodeKey;
  pathParentKeys: TreeNodeKey[];
  children?: TreeModelNode<T>[];
};
export interface TreeModelOptions<T extends TreeData = TreeData> {
  fieldNames?: TreeFieldNames;
  selectable: TreeCheckable<T>;
  checkable: TreeCheckable<T>;
  blockNode: boolean;
  showLine: boolean;
  loadMore: boolean;
  draggable: boolean;
}
