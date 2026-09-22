import type { EllipsisTooltipProps } from '../ellipsis';

export const TAG_COLORS = [
  'red',
  'orangered',
  'orange',
  'gold',
  'lime',
  'green',
  'cyan',
  'blue',
  'sdblue',
  'purple',
  'pinkpurple',
  'magenta',
  'gray',
] as const;

export type TagColor = (typeof TAG_COLORS)[number];

export interface TagProps {
  /**
   * @zh 标签的颜色
   * @en Label color
   */
  color?: string;
  /**
   * @zh 标签的大小
   * @en Label size
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * @zh 是否显示边框
   * @en Whether the tag is bordered
   */
  bordered?: boolean;
  /**
   * @zh 标签是否可见
   * @en Whether the tag is visible
   */
  visible?: boolean;
  /**
   * @zh 标签默认是否可见
   * @en Whether the tag is visible by default
   */
  defaultVisible?: boolean;
  /**
   * @zh 标签是否为加载中状态
   * @en Whether the tag is loading state
   */
  loading?: boolean;
  /**
   * @zh 标签是否可关闭
   * @en Whether the tag can be closed
   */
  closable?: boolean;
  /**
   * @zh 标签是否可选中
   * @en Whether the tag can be checked
   */
  checkable?: boolean;
  /**
   * @zh 标签是否选中（标签可选中时可用）
   * @en Whether the tag is checked (available when the tag is checkable)
   */
  checked?: boolean;
  /**
   * @zh 标签默认选中状态（标签可选中时可用）
   * @en Whether the tag is checked by default (available when the tag is checkable)
   */
  defaultChecked?: boolean;
  /**
   * @zh 标签内容不换行。已废弃，建议改用 ellipsis。
   * @en Tag content does not wrap. Deprecated, use ellipsis instead.
   */
  nowrap?: boolean;
  /**
   * @zh 是否开启默认内容省略
   * @en Whether to enable ellipsis for the default slot content
   * @defaultValue true
   */
  ellipsis?: boolean;
  /**
   * @zh 默认内容省略的最大显示行数
   * @en Maximum number of displayed lines for ellipsis content
   */
  ellipsisLineClamp?: number | string;
  /**
   * @zh 省略内容的展开触发方式
   * @en Trigger mode for ellipsis expansion
   * @values 'click'
   */
  ellipsisExpandTrigger?: 'click';
  /**
   * @zh 省略时是否展示提示。可传入 Tooltip 属性。
   * @en Whether to show a tooltip when ellipsis is active. Tooltip props are supported.
   * @defaultValue true
   */
  ellipsisTooltip?: boolean | EllipsisTooltipProps;
  /**
   * @zh 自定义提示内容。设置后（或使用 tooltip 插槽时）无论内容是否省略，hover 时都会显示提示；ellipsis-tooltip 显式关闭（false 或 disabled: true）时除外
   * @en Custom tooltip content. When set (or when the tooltip slot is used), the tooltip shows on hover whether or not the content is truncated, unless the ellipsis tooltip is explicitly disabled (false or disabled: true)
   * @version 4.8.0
   */
  tooltip?: string;
  /**
   * @zh 是否使用高性能省略实现
   * @en Whether to use the performant ellipsis implementation
   */
  ellipsisPerformant?: boolean;
  /**
   * @zh 自定义颜色的文字颜色，仅在自定义颜色时生效
   * @en Text color for custom color tags, only effective when using a custom color
   */
  textColor?: string;
  /**
   * @zh 自定义颜色的背景透明度，仅在自定义颜色时生效。未显式传入时：若颜色自带透明度则使用该透明度，否则为 0.8
   * @en Background opacity for custom color tags, only effective when using a custom color. When not explicitly set, uses the color's own opacity if it has one, otherwise 0.8
   */
  backgroundAlpha?: number;
}
