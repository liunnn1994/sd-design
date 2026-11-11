export type KvListType = 'http-header' | 'secret';

export interface KvListItem {
  /**
   * @zh 键
   * @en Key
   */
  key: string;
  /**
   * @zh 值
   * @en Value
   */
  value: string;
}

export interface KvListFieldSlotProps {
  value: string;
  item: Readonly<KvListItem>;
  index: number;
  props: Readonly<Record<string, unknown>>;
  update: (value: string) => void;
}

export interface KvListRowActionsSlotProps {
  item: Readonly<KvListItem>;
  index: number;
}

export interface KvListWorkingItem extends KvListItem {
  id: number;
}

export interface KvListOptions<KeyProps = unknown, ValueProps = unknown> {
  /**
   * @zh 编辑器类型。默认使用两个 Input
   * @en Editor type. Uses two Input components by default
   */
  type?: KvListType;
  /**
   * @zh 透传给键编辑组件的属性
   * @en Props passed through to the key editor
   */
  keyProps?: KeyProps;
  /**
   * @zh 透传给值编辑组件的属性
   * @en Props passed through to the value editor
   */
  valueProps?: ValueProps;
  /**
   * @zh 是否禁用编辑和结构操作
   * @en Whether editing and structural actions are disabled
   */
  disabled?: boolean;
  /**
   * @zh 是否允许 Bulk 编辑。secret 类型默认关闭，其他类型默认开启
   * @en Whether bulk editing is available. Disabled by default for secret type
   */
  bulkEditable?: boolean;
}
