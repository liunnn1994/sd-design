import type { PanelController } from '@sdata/web-core/panel-group/panel';
import type { PanelSize, PanelSlotProps, PanelTransition } from '@sdata/web-core/panel-group/types';
import type { ComponentPropsWithRef, CSSProperties, ReactNode } from 'react';

export type { PanelSize, PanelSlotProps, PanelTransition } from '@sdata/web-core/panel-group/types';
export type PanelPose = CSSProperties;
export interface PanelFold {
  shown?: PanelPose;
  hidden?: PanelPose;
}
interface PanelMoveEvents {
  onMoveStart?(event: PointerEvent): void;
  onMoving?(event: PointerEvent): void;
  onMoveEnd?(event: PointerEvent): void;
}
export interface PanelGroupProps extends ComponentPropsWithRef<'div'>, PanelMoveEvents {
  orientation?: 'horizontal' | 'vertical';
  component?: string;
  disabled?: boolean;
  reorder?: boolean;
  transition?: PanelTransition;
}
export interface PanelProps
  extends Omit<ComponentPropsWithRef<'div'>, 'children'>, PanelMoveEvents {
  size?: PanelSize;
  defaultSize?: PanelSize;
  collapsed?: boolean;
  fold?: PanelFold;
  minSize?: PanelSize;
  maxSize?: PanelSize;
  pin?: boolean;
  keepMounted?: boolean;
  transition?: PanelTransition;
  onSizeChange?(size: PanelSize): void;
  onCollapsedChange?(collapsed: boolean): void;
  children?: ReactNode | ((state: PanelSlotProps) => ReactNode);
}
export interface PanelSeparatorProps extends ComponentPropsWithRef<'div'> {
  ariaLabel?: string;
  /** Internal automatic edge grip. */
  own?: PanelController;
}
