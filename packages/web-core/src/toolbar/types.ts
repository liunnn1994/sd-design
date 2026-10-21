/**
 * @zh 工具栏表单数据对象（与 `v-model` 绑定）
 * @en Toolbar form data object (bound via `v-model`)
 */
export type ToolbarModelValue = Record<string, unknown>;

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
