import type { TriggerEvent, TriggerPosition } from '@sdata/web-core/_utils/constant';
import type { TriggerOptions } from '@sdata/web-core/trigger/foundation';
import type { TriggerPopupTranslate } from '@sdata/web-core/trigger/position';
import type { CSSProperties, HTMLAttributes, ReactElement, ReactNode, Ref } from 'react';

import type { FloatingOptions } from './use-floating-position.js';

export type { TriggerEvent, TriggerPosition } from '@sdata/web-core/_utils/constant';
export type { TriggerPopupTranslate } from '@sdata/web-core/trigger/position';

export interface TriggerProps
  extends Partial<TriggerOptions>, Omit<HTMLAttributes<HTMLElement>, 'children' | 'content'> {
  children: ReactElement;
  ref?: Ref<HTMLElement>;
  content?: ReactNode;
  popupVisible?: boolean;
  defaultPopupVisible?: boolean;
  trigger?: TriggerEvent | TriggerEvent[];
  position?: TriggerPosition;
  popupOffset?: number;
  popupTranslate?: TriggerPopupTranslate;
  showArrow?: boolean;
  contentClass?: string;
  contentStyle?: CSSProperties;
  arrowClass?: string;
  arrowStyle?: CSSProperties;
  popupStyle?: CSSProperties;
  animationName?: string;
  duration?: number | { enter: number; leave: number };
  autoFitPopupWidth?: boolean;
  autoFitPopupMinWidth?: boolean;
  autoFitPopupSize?: boolean;
  autoFixPosition?: boolean;
  popupContainer?: string | HTMLElement;
  referenceElement?: HTMLElement | null;
  updateAtScroll?: boolean;
  autoFitTransformOrigin?: boolean;
  hideEmpty?: boolean;
  openedClass?: string;
  autoFitPosition?: boolean;
  renderToBody?: boolean;
  scrollToClose?: boolean;
  floatingOptions?: FloatingOptions;
  ariaHasPopup?: boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
  ariaDescribedbyPopup?: boolean;
  onPopupVisibleChange?: (visible: boolean) => void;
  onShow?: () => void;
  onHide?: () => void;
  onResize?: () => void;
}
