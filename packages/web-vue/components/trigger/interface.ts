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
  popupVisible?: boolean;
  defaultPopupVisible?: boolean;
  trigger?: TriggerEvent;
  position?: TriggerPosition;
  disabled?: boolean;
  popupOffset?: number;
  popupTranslate?: TriggerPopupTranslate;
  showArrow?: boolean;
  alignPoint?: boolean;
  popupHoverStay?: boolean;
  blurToClose?: boolean;
  clickToClose?: boolean;
  clickOutsideToClose?: boolean;
  unmountOnClose?: boolean;
  contentClass?: ClassName;
  contentStyle?: CSSProperties;
  arrowClass?: ClassName;
  arrowStyle?: CSSProperties;
  popupStyle?: CSSProperties;
  animationName?: string;
  duration?:
    | number
    | {
        enter: number;
        leave: number;
      };
  mouseEnterDelay?: number;
  mouseLeaveDelay?: number;
  focusDelay?: number;
  autoFitPopupWidth?: boolean;
  autoFitPopupMinWidth?: boolean;
  autoFixPosition?: boolean;
  popupContainer?: string | HTMLElement;
  updateAtScroll?: boolean;
  autoFitTransformOrigin?: boolean;
  hideEmpty?: boolean;
  opendClass?: string | string[] | Record<string, boolean>;
  autoFitPosition?: boolean;
  renderToBody?: boolean;
  preventFocus?: boolean;
  scrollToClose?: boolean;
  scrollToCloseDistance?: number;
}
