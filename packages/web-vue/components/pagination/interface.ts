import { CSSProperties } from 'vue';

import { Size } from '../_utils/constant';
import { SelectProps } from '../select';

export { PAGE_ITEM_TYPES } from '@sdata/web-core/pagination/types';
export type { PageItemType } from '@sdata/web-core/pagination/types';

export type PaginationSelectProps = Omit<SelectProps, 'value' | 'modelValue' | 'defaultValue'>;

export interface PaginationProps {
  total?: number;
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
  size?: Size;
  pageItemStyle?: CSSProperties;
  activePageItemStyle?: CSSProperties;
  baseSize?: number;
  bufferSize?: number;
  autoAdjust?: boolean;
}
