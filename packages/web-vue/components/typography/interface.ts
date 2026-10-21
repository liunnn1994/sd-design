import type { EllipsisConfig } from '@sdata/web-core/typography/types';
export type {
  EllipsisConfig,
  EllipsisProps,
  CopyProps,
  EditProps,
  OperationsProps,
  BaseProps,
  TitleProps,
  ParagraphProps,
} from '@sdata/web-core/typography/types';

export interface EllipsisInternalConfig extends Required<EllipsisConfig> {
  showTooltip: boolean;
  TooltipComponent: import('vue').Component;
  tooltipProps: { [key: string]: unknown };
}
