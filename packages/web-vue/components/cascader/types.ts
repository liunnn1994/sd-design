import type { VirtualListProps } from '../_components/virtual-list/interface';
import type { FitWidthProps } from '../_hooks/use-fit-width';
import type { Size } from '../_utils/constant';
import type { FloatingOptions } from '../_utils/floating';
import type { SpinProps } from '../spin';
import type { TriggerProps } from '../trigger';
import type {
  CascaderFallback,
  CascaderFieldNames,
  CascaderFormatLabel,
  CascaderLoadMore,
  CascaderModelValue,
  CascaderOption,
} from './interface';

export type CascaderExpandTrigger = 'click' | 'hover';

export interface CascaderTriggerSlotProps {
  value: CascaderModelValue;
  displayValue: string | string[];
  inputValue: string;
  selectedOptions: CascaderOption[];
  selectedPaths: CascaderOption[][];
  popupVisible: boolean;
  disabled: boolean;
  loading: boolean;
  multiple: boolean;
}

export interface CascaderProps extends FitWidthProps {
  /**
   * @zh 是否路径模式，选择值为从根到叶的完整路径数组
   * @en Whether values are full path arrays from root to leaf
   */
  pathMode?: boolean;
  /**
   * @zh 是否多选
   * @en Whether multiple selection is allowed
   */
  multiple?: boolean;
  /**
   * @zh 选中项超出宽度时是否省略
   * @en Whether to ellipsize the selected content when it overflows
   */
  ellipsis?: boolean | 'performant-ellipsis';
  /**
   * @zh 绑定值（v-model）
   * @en Bound value (v-model)
   */
  modelValue?: CascaderModelValue;
  /**
   * @zh 默认值（非受控状态）
   * @en Default value (uncontrolled state)
   */
  defaultValue?: CascaderModelValue;
  /**
   * @zh 级联选项数据
   * @en Cascader option data
   */
  options?: CascaderOption[];
  /**
   * @zh 是否禁用
   * @en Whether the cascader is disabled
   */
  disabled?: boolean;
  /**
   * @zh 是否只读，传入字符串时作为提示文案
   * @en Whether the cascader is readonly; a string is shown as a tip
   */
  readonly?: boolean | string;
  /**
   * @zh 是否为错误状态
   * @en Whether the cascader is in error state
   */
  error?: boolean;
  /**
   * @zh 尺寸
   * @en Size of the cascader
   */
  size?: Size;
  /**
   * @zh 是否允许搜索
   * @en Whether searching is allowed
   */
  allowSearch?: boolean;
  /**
   * @zh 选项是否可过滤
   * @en Whether options are filterable
   */
  filterable?: boolean;
  /**
   * @zh 是否允许清除
   * @en Whether the value can be cleared
   */
  allowClear?: boolean;
  /**
   * @zh 是否显示清除按钮
   * @en Whether the clear button is shown
   */
  clearable?: boolean;
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
   * @zh 下拉浮层是否显示（受控）
   * @en Whether the dropdown popup is visible (controlled)
   */
  popupVisible?: boolean;
  /**
   * @zh 是否显示下拉浮层（受控）
   * @en Whether the dropdown popup is shown (controlled)
   */
  show?: boolean;
  /**
   * @zh 展开下级的触发方式
   * @en How a parent option expands its children
   */
  expandTrigger?: CascaderExpandTrigger;
  /**
   * @zh 下拉浮层是否默认显示（非受控状态）
   * @en Whether the dropdown popup is visible by default (uncontrolled state)
   */
  defaultPopupVisible?: boolean;
  /**
   * @zh 是否默认显示下拉浮层（非受控状态）
   * @en Whether the dropdown popup is shown by default (uncontrolled state)
   */
  defaultShow?: boolean;
  /**
   * @zh 占位符
   * @en Placeholder shown when nothing is selected
   */
  placeholder?: string;
  /**
   * @zh 选项的过滤方式
   * @en How the options are filtered
   */
  filterOption?: (inputValue: string, option: CascaderOption) => boolean;
  /**
   * @zh 下拉浮层挂载的容器
   * @en Container the dropdown popup is mounted into
   */
  popupContainer?: string | HTMLElement;
  /**
   * @zh 最多显示的标签数量，超过后折叠；设为 responsive 时按容器宽度自适应
   * @en Maximum number of visible tags before collapsing; `responsive` adapts to the container width
   */
  maxTagCount?: number | 'responsive';
  /**
   * @zh 是否展示已选中的完整路径
   * @en Whether to show the full path of the selected value
   */
  showPath?: boolean;
  /**
   * @zh 路径各级之间的分隔符
   * @en Separator between the levels of the path
   */
  separator?: string;
  /**
   * @zh 自定义标签渲染方式
   * @en Custom renderer for the selected label
   */
  formatLabel?: CascaderFormatLabel;
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
   * @zh 是否父子不关联，选中父级不会自动选中子级
   * @en Whether parent and child are independent, so selecting a parent does not select its children
   */
  checkStrictly?: boolean;
  /**
   * @zh 异步加载子级数据的方法
   * @en Function that loads children asynchronously
   */
  loadMore?: CascaderLoadMore;
  /**
   * @zh 是否处于加载状态
   * @en Whether the cascader is loading
   */
  loading?: boolean;
  /**
   * @zh 加载状态的组件属性
   * @en Props forwarded to the loading indicator
   */
  spinProps?: SpinProps;
  /**
   * @zh 搜索时是否只匹配选项文案
   * @en Whether search only matches the option label
   */
  searchOptionOnlyLabel?: boolean;
  /**
   * @zh 输入防抖时间（毫秒）
   * @en Debounce delay of the search input in milliseconds
   */
  searchDelay?: number;
  /**
   * @zh 数据结构字段映射
   * @en Field mapping of the option data source
   */
  fieldNames?: CascaderFieldNames;
  /**
   * @zh 取值时使用的对象键名
   * @en Object key used when reading an option value
   */
  valueKey?: string;
  /**
   * @zh 选项不存在时的回退渲染方式
   * @en How an option is rendered when it is not found
   */
  fallback?: boolean | CascaderFallback;
  /**
   * @zh 父级选中时是否自动展开其子级
   * @en Whether selecting a parent expands its children
   */
  expandChild?: boolean;
  /**
   * @zh 虚拟列表的属性，用于大数据量渲染
   * @en Props forwarded to the virtual list, used for large data sets
   */
  virtualListProps?: VirtualListProps;
  /**
   * @zh 标签文本是否不换行
   * @en Whether tag text stays on one line
   */
  tagNowrap?: boolean;
}

export type CascaderEmits = {
  'update:modelValue': [value: CascaderModelValue];
  'update:popupVisible': [visible: boolean];
  'update:show': [visible: boolean];
  'change': [value: CascaderModelValue];
  'inputValueChange': [value: string];
  'clear': [];
  'search': [value: string];
  'popupVisibleChange': [visible: boolean];
  'showChange': [visible: boolean];
  'focus': [ev: FocusEvent];
  'blur': [ev: FocusEvent];
};

export interface CascaderPanelProps {
  /**
   * @zh 是否路径模式，选择值为从根到叶的完整路径数组
   * @en Whether values are full path arrays from root to leaf
   */
  pathMode?: boolean;
  /**
   * @zh 是否多选
   * @en Whether multiple selection is allowed
   */
  multiple?: boolean;
  /**
   * @zh 选中项超出宽度时是否省略
   * @en Whether to ellipsize the selected content when it overflows
   */
  ellipsis?: boolean | 'performant-ellipsis';
  /**
   * @zh 绑定值（v-model）
   * @en Bound value (v-model)
   */
  modelValue?: CascaderModelValue;
  /**
   * @zh 默认值（非受控状态）
   * @en Default value (uncontrolled state)
   */
  defaultValue?: CascaderModelValue;
  /**
   * @zh 级联选项数据
   * @en Cascader option data
   */
  options?: CascaderOption[];
  /**
   * @zh 展开下级的触发方式
   * @en How a parent option expands its children
   */
  expandTrigger?: CascaderExpandTrigger;
  /**
   * @zh 是否父子不关联，选中父级不会自动选中子级
   * @en Whether parent and child are independent
   */
  checkStrictly?: boolean;
  /**
   * @zh 异步加载子级数据的方法
   * @en Function that loads children asynchronously
   */
  loadMore?: CascaderLoadMore;
  /**
   * @zh 数据结构字段映射
   * @en Field mapping of the option data source
   */
  fieldNames?: CascaderFieldNames;
  /**
   * @zh 取值时使用的对象键名
   * @en Object key used when reading an option value
   */
  valueKey?: string;
  /**
   * @zh 父级选中时是否自动展开其子级
   * @en Whether selecting a parent expands its children
   */
  expandChild?: boolean;
}

export type CascaderPanelEmits = {
  'update:modelValue': [value: CascaderModelValue];
  'change': [value: CascaderModelValue];
};
