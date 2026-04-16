import type { CSSProperties } from 'vue';

import type { TriggerPosition } from '../_utils/constant';
import type { ClassName } from '../_utils/types';
import type { TriggerProps } from '../trigger';

export interface EllipsisTooltipProps extends Omit<
  Partial<TriggerProps>,
  'popupVisible' | 'defaultPopupVisible' | 'disabled'
> {
  /**
   * @zh 文字气泡位置
   * @en Tooltip position
   */
  position?: TriggerPosition;
  /**
   * @zh 是否展示为迷你尺寸
   * @en Whether to display as a mini size
   */
  mini?: boolean;
  /**
   * @zh 弹出框的背景颜色
   * @en Background color of the tooltip
   */
  backgroundColor?: string;
  /**
   * @zh 弹出框内容的类名
   * @en The class name of the popup content
   */
  contentClass?: ClassName;
  /**
   * @zh 弹出框内容的样式
   * @en The style of the popup content
   */
  contentStyle?: CSSProperties;
  /**
   * @zh 弹出框箭头的类名
   * @en The class name of the popup arrow
   */
  arrowClass?: ClassName;
  /**
   * @zh 弹出框箭头的样式
   * @en The style of the popup arrow
   */
  arrowStyle?: CSSProperties;
  /**
   * @zh 是否挂载在 body 元素下
   * @en Whether to mount under the body element
   */
  renderToBody?: boolean;
  /**
   * @zh 是否禁用省略提示
   * @en Whether to disable the ellipsis tooltip
   */
  disabled?: boolean;
}
