import { CSSProperties } from 'vue';

import type { FloatingOptions } from '../_utils/floating';
import type { ClassName } from '../_utils/types';

import { TriggerEvent, TriggerPosition } from '../_utils/constant';

export type TriggerPopupTranslate =
  | [number, number]
  | { [key in TriggerPosition]?: [number, number] };

export interface TriggerProps {
  /**
   * @zh Floating UI Vue 的完整配置。与旧定位参数冲突时以此配置为准。
   * @en Complete Floating UI Vue options. These options take precedence over legacy positioning props.
   */
  floatingOptions?: FloatingOptions;
  /**
   * @zh 浮层是否显示（受控）
   * @en Whether the popup is visible (controlled)
   */
  popupVisible?: boolean;
  /**
   * @zh 浮层是否默认显示（非受控）
   * @en Whether the popup is visible by default (uncontrolled state)
   */
  defaultPopupVisible?: boolean;
  /**
   * @zh 触发浮层的事件
   * @en Events that open the popup
   */
  trigger?: TriggerEvent | TriggerEvent[];
  /**
   * @zh 浮层相对触发器的位置
   * @en Position of the popup relative to the trigger
   */
  position?: TriggerPosition;
  /**
   * @zh 是否禁用
   * @en Whether the trigger is disabled
   */
  disabled?: boolean;
  /**
   * @zh 浮层相对触发器的偏移量（像素）
   * @en Offset between the popup and the trigger in pixels
   */
  popupOffset?: number;
  /**
   * @zh 浮层位置的微调
   * @en Fine adjustment of the popup position
   */
  popupTranslate?: TriggerPopupTranslate;
  /**
   * @zh 是否显示箭头
   * @en Whether to show the arrow
   */
  showArrow?: boolean;
  /**
   * @zh 是否让浮层中心对齐触发点
   * @en Whether the popup is centred on the trigger point
   */
  alignPoint?: boolean;
  /**
   * @zh 失焦时是否关闭浮层
   * @en Whether closing the popup on blur is enabled
   */
  blurToClose?: boolean;
  /**
   * @zh 点击触发元素时是否关闭浮层
   * @en Whether clicking the trigger closes the popup
   */
  clickToClose?: boolean;
  /**
   * @zh 点击浮层外部时是否关闭浮层
   * @en Whether clicking outside the popup closes it
   */
  clickOutsideToClose?: boolean;
  /**
   * @zh 关闭时是否卸载浮层内容
   * @en Whether the popup content is unmounted when closed
   */
  unmountOnClose?: boolean;
  /**
   * @zh 浮层内容的类名
   * @en Class name of the popup content
   */
  contentClass?: ClassName;
  /**
   * @zh 浮层内容的样式
   * @en Style of the popup content
   */
  contentStyle?: CSSProperties;
  /**
   * @zh 箭头的类名
   * @en Class name of the arrow
   */
  arrowClass?: ClassName;
  /**
   * @zh 箭头的样式
   * @en Style of the arrow
   */
  arrowStyle?: CSSProperties;
  /**
   * @zh 浮层的样式
   * @en Style of the popup
   */
  popupStyle?: CSSProperties;
  /**
   * @zh 浮层动画类型
   * @en Transition used by the popup
   */
  animationName?: string;
  /**
   * @zh 动画时长（毫秒），可分别配置进入与离开
   * @en Transition duration in milliseconds; enter and leave can differ
   */
  duration?:
    | number
    | {
        enter: number;
        leave: number;
      };
  /**
   * @zh 鼠标进入的延迟时间（毫秒）
   * @en Delay before opening on mouseenter in milliseconds
   */
  mouseEnterDelay?: number;
  /**
   * @zh 鼠标离开的延迟时间（毫秒）
   * @en Delay before closing on mouseleave in milliseconds
   */
  mouseLeaveDelay?: number;
  /**
   * @zh 聚焦的延迟时间（毫秒）
   * @en Delay before opening on focus in milliseconds
   */
  focusDelay?: number;
  /**
   * @zh 是否使浮层宽度与触发元素一致
   * @en Whether the popup width matches the trigger
   */
  autoFitPopupWidth?: boolean;
  /**
   * @zh 是否使浮层最小宽度与触发元素一致
   * @en Whether the popup min-width matches the trigger
   */
  autoFitPopupMinWidth?: boolean;
  /**
   * @zh 触发元素变化时是否自动修正浮层位置
   * @en Whether the popup position is corrected when the trigger resizes
   */
  autoFixPosition?: boolean;
  /**
   * @zh 浮层挂载的容器
   * @en Container the popup is mounted into
   */
  popupContainer?: string | HTMLElement;
  /**
   * @zh 滚动时是否更新浮层位置
   * @en Whether the popup position updates on scroll
   */
  updateAtScroll?: boolean;
  /**
   * @zh 是否自动对齐动画变换原点
   * @en Whether the animation transform origin follows the placement
   */
  autoFitTransformOrigin?: boolean;
  /**
   * @zh 内容为空时是否隐藏浮层
   * @en Whether to hide the popup when the content is empty
   */
  hideEmpty?: boolean;
  /**
   * @zh 浮层打开时附加到触发元素的类名
   * @en Class applied to the trigger while the popup is open
   */
  openedClass?: string | string[] | Record<string, boolean>;
  /**
   * @zh 浮层超出视口时是否自动调整位置
   * @en Whether the popup flips/shifts to stay inside the viewport
   */
  autoFitPosition?: boolean;
  /**
   * @zh 浮层是否挂载到 body
   * @en Whether the popup is mounted to body
   */
  renderToBody?: boolean;
  /**
   * @zh 打开浮层时是否阻止触发元素获得焦点
   * @en Whether opening the popup prevents the trigger from taking focus
   */
  preventFocus?: boolean;
  /**
   * @zh 滚动时是否关闭浮层
   * @en Whether scrolling closes the popup
   */
  scrollToClose?: boolean;
  /**
   * @zh 滚动多少距离后关闭浮层
   * @en Scroll distance after which the popup closes
   */
  scrollToCloseDistance?: number;
  /**
   * @zh 按 Esc 是否关闭浮层
   * @en Whether pressing Escape closes the popup
   */
  escToClose?: boolean;
  /**
   * @zh 写入 aria-haspopup 的值
   * @en Value written to aria-haspopup
   */
  ariaHasPopup?: boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
  /**
   * @zh 浮层内容是否通过 aria-describedby 关联
   * @en Whether the popup content is linked via aria-describedby
   */
  ariaDescribedbyPopup?: boolean;
}
