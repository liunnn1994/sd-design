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
export type TourProps = Config;
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
