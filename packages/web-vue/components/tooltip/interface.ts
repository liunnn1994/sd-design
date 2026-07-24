import type { CSSProperties } from 'vue';

import type { TriggerPosition } from '../_utils/constant';
import type { FloatingOptions } from '../_utils/floating';
import type { ClassName } from '../_utils/types';

export interface TooltipProps {
  /**
   * @zh Floating UI Vue 的完整配置。
   * @en Complete Floating UI Vue options.
   */
  floatingOptions?: FloatingOptions;
  /**
   * @zh 文字气泡是否可见
   * @en Whether the tooltip is visible
   * @vModel
   */
  popupVisible?: boolean;
  /**
   * @zh 文字气泡默认是否可见（非受控模式）
   * @en Whether the tooltip is visible by default (uncontrolled mode)
   */
  defaultPopupVisible?: boolean;
  /**
   * @zh 文字气泡是否禁用
   * @en Whether to disable the tooltip
   */
  disabled?: boolean;
  /**
   * @zh 文字气泡内容
   * @en Tooltip content
   */
  content?: string;
  /**
   * @zh 弹出位置
   * @en Popup position
   * @values 'top','tl','tr','bottom','bl','br','left','lt','lb','right','rt','rb'
   */
  position?: TriggerPosition;
  /**
   * @zh 是否展示为迷你尺寸
   * @en Whether to display as a mini size
   */
  mini?: boolean;
  /**
   * @zh 弹出框的背景颜色
   * @en Background color of the popover
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
   * @zh 弹出框的挂载容器
   * @en Mount container for popup
   */
  popupContainer?: string | HTMLElement;
}
