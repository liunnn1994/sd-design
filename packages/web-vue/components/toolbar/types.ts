import type { ButtonProps } from '../button';
import type { JsonFormSchema } from '../json-form';
import type { SpinProps } from '../spin';

/**
 * @zh 工具栏表单数据对象（与 `v-model` 绑定）
 * @en Toolbar form data object (bound via `v-model`)
 */
export type ToolbarModelValue = Record<string, unknown>;

/**
 * @zh Toolbar 组件的属性
 * @en Props of the Toolbar component
 */
export interface ToolbarProps {
  /**
   * @zh schema 驱动的筛选项配置；为空且没有默认插槽时不渲染表单
   * @en Schema-driven filter items; the form is not rendered when empty and the default slot is absent
   */
  schemas?: JsonFormSchema<string>[];
  /**
   * @zh 是否处于加载中（覆盖在内容区上的遮罩）
   * @en Whether the toolbar is loading (an overlay over the content)
   */
  loading?: boolean;
  /**
   * @zh 传递给加载中 Spin 的属性
   * @en Props passed to the loading Spin
   */
  spinProps?: SpinProps;
  /**
   * @zh 是否显示查询按钮
   * @en Whether to show the search button
   */
  showSearch?: boolean;
  /**
   * @zh 是否显示重置按钮
   * @en Whether to show the reset button
   */
  showReset?: boolean;
  /**
   * @zh 查询按钮属性
   * @en Props of the search button
   */
  searchBtn?: ButtonProps;
  /**
   * @zh 重置按钮属性
   * @en Props of the reset button
   */
  resetBtn?: ButtonProps;
  /**
   * @zh 是否显示右侧操作区
   * @en Whether to show the right-side action area
   */
  showActions?: boolean;
  /**
   * @zh 查询按钮文案
   * @en Text of the search button
   */
  searchText?: string;
  /**
   * @zh 重置按钮文案
   * @en Text of the reset button
   */
  resetText?: string;
  /**
   * @zh 展开按钮文案
   * @en Text shown when the toolbar can be expanded
   */
  expandText?: string;
  /**
   * @zh 收起按钮文案
   * @en Text shown when the toolbar can be collapsed
   */
  collapseText?: string;
  /**
   * @zh 是否允许在内容溢出时展开/收起
   * @en Whether to allow expand/collapse when content overflows
   */
  allowExpand?: boolean;
  /**
   * @zh 初始是否展开（非受控）
   * @en Whether the toolbar is expanded initially (uncontrolled)
   */
  defaultExpand?: boolean;
  /**
   * @zh 单行高度（px），用于收起态的裁切与溢出判定
   * @en Single row height in px, used for collapsed clipping and overflow detection
   */
  itemHeight?: number;
  /**
   * @zh 每个筛选项的最小列宽（px）
   * @en Minimum column width in px for each filter item
   */
  spanWidth?: number;
  /**
   * @zh 每个筛选项的最大宽度（CSS 宽度值），默认 `unset` 表示不限制
   * @en Maximum width of each filter item (any CSS width value); defaults to `unset` (unlimited)
   */
  itemMaxWidth?: string;
  /**
   * @zh 是否显示底部分隔线
   * @en Whether to show the bottom divider
   */
  showBorderBottom?: boolean;
  /**
   * @zh 重置时需要保留当前值（不还原）的字段名集合
   * @en Field names whose current values should be preserved (not reset) on reset
   */
  resetSkipKeys?: string[];
}

/**
 * @zh Toolbar 组件的事件
 * @en Events of the Toolbar component
 */
export interface ToolbarEmits {
  /**
   * @zh 点击查询按钮、按下回车或调用 `search()` 时触发
   * @en Emitted when the search button is clicked, Enter is pressed, or `search()` is called
   * @property {ToolbarModelValue} params 当前表单数据
   */
  search: [params: ToolbarModelValue];
  /**
   * @zh 点击重置按钮或调用 `reset()` 时触发
   * @en Emitted when the reset button is clicked or `reset()` is called
   */
  reset: [];
}

/**
 * @zh `search` 事件回调
 * @en Handler for the `search` event
 */
export type ToolbarSearchEventHandler = (params: ToolbarModelValue) => void;

/**
 * @zh `reset` 事件回调
 * @en Handler for the `reset` event
 */
export type ToolbarResetEventHandler = () => void;
