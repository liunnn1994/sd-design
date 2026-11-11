import type { TourConfig, TourController, TourSlotProps } from '@sdata/web-core/tour/types';
import type { ReactNode, Ref } from 'react';

export type {
  TourAlignment,
  TourAllowedButton,
  TourConfig,
  TourController,
  TourExpose,
  TourStepHook,
  TourStep,
  TourPopover,
  TourPopoverDom,
  TourSide,
  TourState,
  TourSlotProps,
} from '@sdata/web-core/tour/types';

export interface TourProps extends TourConfig {
  children?: ReactNode;
  ref?: Ref<TourController>;
  renderTitle?: (state: TourSlotProps) => ReactNode;
  renderDescription?: (state: TourSlotProps) => ReactNode;
  renderProgress?: (state: TourSlotProps) => ReactNode;
  renderFooter?: (state: TourSlotProps) => ReactNode;
}
export type TourInstance = TourController;
