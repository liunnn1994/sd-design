import type { ComponentPropsWithRef, ReactNode } from 'react';

import type { EllipsisTooltipProps } from '../ellipsis/index.js';
import type { TooltipProps } from '../tooltip/index.js';

export interface ButtonOptions {
  type?: 'secondary' | 'primary' | 'dashed' | 'outline' | 'text';
  shape?: 'square' | 'round' | 'circle';
  status?: 'normal' | 'warning' | 'success' | 'danger';
  size?: 'mini' | 'small' | 'medium' | 'large';
  disabled?: boolean;
}

interface ButtonContent extends ButtonOptions {
  long?: boolean;
  loading?: boolean;
  loadingFixedWidth?: boolean;
  icon?: ReactNode;
  srOnly?: ReactNode;
  tooltip?: string | Omit<TooltipProps, 'children'>;
  tooltipContent?: ReactNode;
  ellipsis?: boolean;
  ellipsisLineClamp?: number | string;
  ellipsisExpandTrigger?: 'click';
  ellipsisTooltip?: boolean | EllipsisTooltipProps;
  ellipsisTooltipContent?: ReactNode;
}

export type ButtonProps = ButtonContent &
  (
    | (Omit<ComponentPropsWithRef<'button'>, 'type' | 'disabled'> & {
        href?: never;
        htmlType?: 'button' | 'submit' | 'reset';
      })
    | (Omit<ComponentPropsWithRef<'a'>, 'type'> & { href: string; htmlType?: never })
  );

export interface ButtonGroupProps extends ComponentPropsWithRef<'div'>, ButtonOptions {}
