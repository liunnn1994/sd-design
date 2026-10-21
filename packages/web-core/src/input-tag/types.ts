export interface TagData<TTagProps = { closable?: boolean }> {
  /**
   * @zh 标签值
   * @en Tag value
   */
  value?: string | number;
  /**
   * @zh 标签内容
   * @en Tag content
   */
  label?: string;
  /**
   * @zh 是否可关闭
   * @en Whether to close
   */
  closable?: boolean;
  /**
   * @zh 标签属性
   * @en Tag props
   */
  tagProps?: TTagProps;
  [other: string]: unknown;
}

export type InputTagFieldNames = { [K in keyof TagData]?: string };

export interface TagDataInfo<TTagProps = { closable?: boolean }> extends TagData<TTagProps> {
  raw: Record<string, unknown>;
  value: string | number;
  label: string;
  closable: boolean;
}
