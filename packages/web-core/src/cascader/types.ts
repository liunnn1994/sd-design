type BaseType = string | number;
export type CascaderOptionValue = BaseType | Record<string, unknown>;

export type CascaderPathValue = CascaderOptionValue[];

export type CascaderSingleValue = CascaderOptionValue | CascaderPathValue;

export type CascaderModelValue = CascaderSingleValue | CascaderSingleValue[] | undefined;
export interface CascaderOption<P = unknown> {
  /**
   * @zh 选项值，2.29.0 版本支持对象
   * @en Option value, version 2.29.0 supports objects
   */
  value?: CascaderOptionValue;
  /**
   * @zh 选项文本
   * @en Option text
   */
  label?: string;
  /**
   * @zh 是否禁用
   * @en Whether to disable
   */
  disabled?: boolean;
  /**
   * @zh 展示的标签属性
   * @en Displayed tag attributes
   * @version 2.8.0
   */
  tagProps?: P;
  /**
   * @zh 下一级选项
   * @en Next level options
   */
  children?: CascaderOption<P>[];
  /**
   * @zh 是否是叶子节点
   * @en Whether it is a leaf node
   */
  isLeaf?: boolean;

  [other: string]: unknown;
}

export type CascaderFieldNames = { [K in keyof CascaderOption]?: string };

export interface CascaderOptionWithTotal<P = unknown> extends CascaderOption<P> {
  children?: CascaderOptionWithTotal<P>[];
  totalLeafOptions?: number;
}

export interface CascaderOptionInfo<P = unknown> extends CascaderOptionWithTotal<P> {
  raw: CascaderOption<P>;
  key: string;
  valueKey: string;
  level: number;
  index: number;
  value: CascaderOptionValue;
  label: string;
  disabled: boolean;
  selectionDisabled: boolean;
  isLeaf: boolean;
  parent?: CascaderOptionInfo<P>;
  children?: CascaderOptionInfo<P>[];
  path: CascaderOptionInfo<P>[];
  pathValue: CascaderPathValue;
}
export type CascaderLazyLoadOptions<P = unknown> = Record<
  string,
  { source: CascaderOption<P>; children: CascaderOption<P>[] }
>;
export interface ValueCell<T> {
  value: T;
}
