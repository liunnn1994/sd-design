import type { VirtualListProps } from '../_components/virtual-list/interface';
import type { FitWidthProps } from '../_hooks/use-fit-width';
import type { Size } from '../_utils/constant';
import type { FloatingOptions } from '../_utils/floating';
import type { ScrollbarProps } from '../scrollbar';
import type { SpinProps } from '../spin';
import type { TriggerProps } from '../trigger';

export type SelectOptionValue = string | number | boolean | Record<string, unknown>;

export type SelectModelValue = SelectOptionValue | SelectOptionValue[] | null | undefined;

export interface SelectTriggerSlotProps {
  value: SelectModelValue;
  displayValue: string | string[];
  inputValue: string;
  selectedOptions: SelectOptionData[];
  popupVisible: boolean;
  disabled: boolean;
  loading: boolean;
  multiple: boolean;
}

export interface OptionValueWithKey {
  value: SelectOptionValue;
  key: string;
}

export interface SelectFieldNames {
  value?: string;
  label?: string;
  children?: string;
  disabled?: string;
  tagProps?: string;
}

export interface SelectOptionData {
  /**
   * @zh 选项值
   * @en Option value
   */
  value?: SelectOptionValue;
  /**
   * @zh 选项内容
   * @en Option label
   */
  label?: string;
  /**
   * @zh 是否禁用
   * @en Whether the option is disabled
   */
  disabled?: boolean;
  /**
   * @zh 多选标签透传属性
   * @en Extra props for rendered tags
   */
  tagProps?: Record<string, unknown>;
  [other: string]: unknown;
}

export interface SelectOptionGroup {
  /**
   * @zh 是否为分组
   * @en Whether the item is a group
   */
  isGroup: true;
  /**
   * @zh 分组标题
   * @en Group label
   */
  label: string;
  /**
   * @zh 分组选项
   * @en Group options
   */
  options: SelectOption[];
  [other: string]: unknown;
}

export type SelectOption = string | number | boolean | SelectOptionData | SelectOptionGroup;

export interface SelectOptionInfo extends SelectOptionData {
  raw: SelectOptionData;
  key: string;
  index?: number;
  origin: 'options' | 'extraOptions';
  value: SelectOptionValue;
  label: string;
}

export interface SelectOptionGroupInfo extends SelectOptionGroup {
  key: string;
  options: (SelectOptionInfo | SelectOptionGroupInfo)[];
}

export type FilterOption = boolean | ((inputValue: string, option: SelectOptionData) => boolean);
export type SelectFallbackOption = (value: SelectOptionValue) => SelectOptionData;

export interface SelectProps extends FitWidthProps {
  /**
   * @zh 可选项数据
   * @en Option data
   */
  options?: SelectOption[];
  /**
   * @zh 选中项超出宽度时是否省略
   * @en Whether to ellipsize the selected content when it overflows
   */
  ellipsis?: boolean | 'performant-ellipsis';
  /**
   * @zh 是否多选
   * @en Whether multiple selection is allowed
   */
  multiple?: boolean;
  /**
   * @zh 绑定值（受控）
   * @en Bound value (controlled)
   */
  value?: SelectModelValue;
  /**
   * @zh 绑定值（v-model）
   * @en Bound value (v-model)
   */
  modelValue?: SelectModelValue;
  /**
   * @zh 默认选中值（非受控状态）
   * @en Default selected value (uncontrolled state)
   */
  defaultValue?: SelectModelValue;
  /**
   * @zh 输入框的值
   * @en Value of the inner input
   */
  inputValue?: string;
  /**
   * @zh 输入框的默认值（非受控状态）
   * @en Default value of the inner input (uncontrolled state)
   */
  defaultInputValue?: string;
  /**
   * @zh 尺寸
   * @en Size of the select
   */
  size?: Size;
  /**
   * @zh 占位符
   * @en Placeholder shown when nothing is selected
   */
  placeholder?: string;
  /**
   * @zh 是否处于加载状态
   * @en Whether the select is loading
   */
  loading?: boolean;
  /**
   * @zh 加载状态的组件属性
   * @en Props forwarded to the loading indicator
   */
  spinProps?: SpinProps;
  /**
   * @zh 是否禁用
   * @en Whether the select is disabled
   */
  disabled?: boolean;
  /**
   * @zh 是否只读，传入字符串时作为提示文案
   * @en Whether the select is readonly; a string is shown as a tip
   */
  readonly?: boolean | string;
  /**
   * @zh 是否为错误状态
   * @en Whether the select is in error state
   */
  error?: boolean;
  /**
   * @zh 是否允许清除
   * @en Whether the value can be cleared
   */
  allowClear?: boolean;
  /**
   * @zh 是否允许搜索，可配置保留输入值
   * @en Whether searching is allowed; accepts options for retaining the input value
   */
  allowSearch?: boolean | { retainInputValue?: boolean };
  /**
   * @zh 是否允许创建不存在的选项
   * @en Whether options that do not exist can be created
   */
  allowCreate?: boolean;
  /**
   * @zh 是否显示下拉箭头
   * @en Whether to show the dropdown arrow
   */
  showArrow?: boolean;
  /**
   * @zh 最多显示的标签数量，超过后折叠；设为 responsive 时按容器宽度自适应
   * @en Maximum number of visible tags before collapsing; `responsive` adapts to the container width
   */
  maxTagCount?: number | 'responsive';
  /**
   * @zh 下拉浮层挂载的容器
   * @en Container the dropdown popup is mounted into
   */
  popupContainer?: string | HTMLElement;
  /**
   * @zh 是否显示边框
   * @en Whether to show the border
   */
  bordered?: boolean;
  /**
   * @zh 下拉浮层是否显示（受控）
   * @en Whether the dropdown popup is visible (controlled)
   */
  popupVisible?: boolean;
  /**
   * @zh 下拉浮层是否默认显示（非受控状态）
   * @en Whether the dropdown popup is visible by default (uncontrolled state)
   */
  defaultPopupVisible?: boolean;
  /**
   * @zh 是否显示下拉浮层（受控）
   * @en Whether the dropdown popup is shown (controlled)
   */
  show?: boolean;
  /**
   * @zh 是否默认显示下拉浮层（非受控状态）
   * @en Whether the dropdown popup is shown by default (uncontrolled state)
   */
  defaultShow?: boolean;
  /**
   * @zh 打开浮层时是否默认选中第一个可用项
   * @en Whether the first available option is activated when the popup opens
   */
  defaultActiveFirstOption?: boolean;
  /**
   * @zh 关闭时是否卸载浮层内容
   * @en Whether the popup content is unmounted when closed
   */
  unmountOnClose?: boolean;
  /**
   * @zh 选项的过滤方式
   * @en How the options are filtered
   */
  filterOption?: FilterOption;
  /**
   * @zh 虚拟列表的属性，用于大数据量渲染
   * @en Props forwarded to the virtual list, used for large data sets
   */
  virtualListProps?: VirtualListProps;
  /**
   * @zh 触发器的组件属性
   * @en Props forwarded to the trigger
   */
  triggerProps?: TriggerProps;
  /**
   * @zh 浮层的定位配置
   * @en Floating options of the popup
   */
  floatingOptions?: FloatingOptions;
  /**
   * @zh 选项不存在时的回退渲染方式
   * @en How an option is rendered when it is not found
   */
  fallbackOption?: boolean | SelectFallbackOption;
  /**
   * @zh 是否显示由输入值动态生成的额外选项
   * @en Whether to show the extra option generated from the input value
   */
  showExtraOptions?: boolean;
  /**
   * @zh 取值时使用的对象键名
   * @en Object key used when reading an option value
   */
  valueKey?: string;
  /**
   * @zh 输入防抖时间（毫秒）
   * @en Debounce delay of the search input in milliseconds
   */
  searchDelay?: number;
  /**
   * @zh 最多可选的项数，0 表示不限制
   * @en Maximum number of selectable options; 0 means no limit
   */
  limit?: number;
  /**
   * @zh 数据结构字段映射
   * @en Field mapping of the option data source
   */
  fieldNames?: SelectFieldNames;
  /**
   * @zh 下拉浮层的滚动条配置
   * @en Scrollbar configuration of the dropdown popup
   */
  scrollbar?: boolean | ScrollbarProps;
  /**
   * @zh 无选项时是否显示浮层头部
   * @en Whether to show the popup header when there are no options
   */
  showHeaderOnEmpty?: boolean;
  /**
   * @zh 无选项时是否显示浮层底部
   * @en Whether to show the popup footer when there are no options
   */
  showFooterOnEmpty?: boolean;
  /**
   * @zh 标签文本是否不换行
   * @en Whether tag text stays on one line
   */
  tagNowrap?: boolean;
}
