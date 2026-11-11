import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

import type { SelectProps } from '../select/index.js';

export type PaginationSelectProps = Omit<SelectProps, 'value' | 'modelValue' | 'defaultValue'>;
export interface PaginationProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  total: number;
  current?: number;
  defaultCurrent?: number;
  pageSize?: number;
  defaultPageSize?: number;
  disabled?: boolean;
  hideOnSinglePage?: boolean;
  simple?: boolean;
  showTotal?: boolean;
  showMore?: boolean;
  showJumper?: boolean;
  showPageSize?: boolean;
  pageSizeOptions?: number[];
  pageSizeProps?: PaginationSelectProps;
  size?: 'mini' | 'small' | 'medium' | 'large';
  pageItemStyle?: CSSProperties;
  activePageItemStyle?: CSSProperties;
  baseSize?: number;
  bufferSize?: number;
  autoAdjust?: boolean;
  onCurrentChange?: (current: number) => void;
  onChange?: (current: number) => void;
  onPageSizeValueChange?: (pageSize: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  renderTotal?: (state: { total: number }) => ReactNode;
  renderPageItem?: (state: { page: number }) => ReactNode;
  renderPageItemStep?: (state: { type: 'next' | 'previous' }) => ReactNode;
  pageItemEllipsis?: ReactNode;
  jumperPrepend?: ReactNode;
  jumperAppend?: ReactNode;
}
export type PaginationConfig = Pick<
  PaginationProps,
  | 'defaultPageSize'
  | 'pageSizeOptions'
  | 'pageSizeProps'
  | 'showTotal'
  | 'showMore'
  | 'showJumper'
  | 'showPageSize'
  | 'autoAdjust'
  | 'baseSize'
  | 'bufferSize'
>;
