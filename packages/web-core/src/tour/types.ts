import type {
  Alignment,
  AllowedButtons,
  Config,
  Driver,
  DriverHook,
  DriveStep,
  Popover,
  PopoverDOM,
  Side,
  State,
} from 'driver.js';

// 直接复用 driver.js 类型，不维护另一套配置或实例协议。
export type TourAlignment = Alignment;
export type TourAllowedButton = AllowedButtons;
export type TourConfig = Config;
interface TourInheritedDefaults {
  animate?: Config['animate'];
  smoothScroll?: Config['smoothScroll'];
  scrollIntoView?: Config['scrollIntoView'];
  allowClose?: Config['allowClose'];
  allowScroll?: Config['allowScroll'];
  allowPageInteraction?: Config['allowPageInteraction'];
  disableActiveInteraction?: Config['disableActiveInteraction'];
  advanceOn?: Config['advanceOn'];
  advanceOnClick?: Config['advanceOnClick'];
  skipMissingElement?: Config['skipMissingElement'];
  allowKeyboardControl?: Config['allowKeyboardControl'];
  showProgress?: Config['showProgress'];
}
// The Vue SFC compiler needs literal keys when extracting runtime props from Omit.
export type TourProps = Omit<
  Config,
  | 'animate'
  | 'smoothScroll'
  | 'scrollIntoView'
  | 'allowClose'
  | 'allowScroll'
  | 'allowPageInteraction'
  | 'disableActiveInteraction'
  | 'advanceOn'
  | 'advanceOnClick'
  | 'skipMissingElement'
  | 'allowKeyboardControl'
  | 'showProgress'
> &
  TourInheritedDefaults;
export type TourController = Driver;
export type TourExpose = Driver;
export type TourStepHook = DriverHook;
export type TourStep = DriveStep;
export type TourPopover = Popover;
export type TourPopoverDom = PopoverDOM;
export type TourSide = Side;
export type TourState = State;

/** Tour 浮层插槽的作用域参数。 */
export interface TourSlotProps {
  driver: Driver;
  step: DriveStep;
  index: number | undefined;
  state: State;
  element: Element | undefined;
}
