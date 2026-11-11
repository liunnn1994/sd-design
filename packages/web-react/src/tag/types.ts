import type { TagProps as CoreTagProps } from '@sdata/web-core/tag/types';
import type { ComponentPropsWithRef, ReactNode } from 'react';

import type { EllipsisTooltipProps } from '../ellipsis/index.js';

export interface TagProps
  extends Omit<ComponentPropsWithRef<'span'>, 'color'>, CoreTagProps<EllipsisTooltipProps> {
  tooltipContent?: ReactNode;
  icon?: ReactNode;
  closeIcon?: ReactNode;
  onVisibleChange?: (value: boolean) => void;
  onCheckedChange?: (value: boolean) => void;
  onClose?: (event: MouseEvent | KeyboardEvent) => void;
  onCheck?: (value: boolean, event: MouseEvent | KeyboardEvent) => void;
}
