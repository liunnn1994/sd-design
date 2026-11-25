import { Slot, Slots } from 'vue';

import type { FloatingOptions } from '../_utils/floating';

import { TriggerEvent, TriggerPosition } from '../_utils/constant';

export type DropdownPosition = 'top' | 'tl' | 'tr' | 'bottom' | 'bl' | 'br';

export interface DropDownProps {
  popupVisible?: boolean;
  defaultPopupVisible?: boolean;
  trigger?: TriggerEvent | TriggerEvent[];
  position?: DropdownPosition;
  popupContainer?: string | HTMLElement;
  floatingOptions?: FloatingOptions;
  popupMaxHeight?: boolean | number;
  hideOnSelect?: boolean;
  isEmpty?: boolean;
}

export interface DOption {
  value: string | number;
  disabled?: boolean | undefined;

  _props?: Record<string, unknown>;
  _slots?: Slots | undefined;
}

export interface DGroup {
  isGroup: true;
  options: DropdownOption[];
  title?: string | undefined;

  _props?: Record<string, unknown>;
  _slots?: Slots | undefined;
}

export interface DSubmenu extends DOption {
  isSubmenu: true;
  render: Slot;
  children: DropdownOption[];
  trigger?: TriggerEvent | undefined;
  position?: TriggerPosition | undefined;
  footer?: Slot | undefined;
  floatingOptions?: FloatingOptions;
}

export type DropdownOption = DOption | DGroup | DSubmenu;
