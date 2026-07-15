import type { CSSProperties, InjectionKey, Ref, Slots } from 'vue';

export type { JsonFormProviderConfig } from '../json-form/types';
import type { VirtualListProps } from '../_components/virtual-list/interface';
import type { Size } from '../_utils/constant';
import type { ButtonProps } from '../button';
import type { ShortcutType, WeekStart } from '../date-picker/interface';
import type { EllipsisTooltipProps } from '../ellipsis';
import type { JsonFormProviderConfig } from '../json-form/types';
import type { SdLang } from '../locale/interface';
import type { PaginationSelectProps } from '../pagination/interface';
import type { SDThemeNormalized } from './theme';

export interface ConfigProviderModal {
  mask?: boolean;
  maskClosable?: boolean;
  maskStyle?: CSSProperties;
  alignCenter?: boolean;
  escToClose?: boolean;
  draggable?: boolean;
  closable?: boolean;
  titleAlign?: 'start' | 'center';
  titleEllipsisTooltip?: boolean | EllipsisTooltipProps;
  top?: number | string;
  footer?: boolean;
  hideCancel?: boolean;
  okText?: string;
  cancelText?: string;
  okButtonProps?: ButtonProps;
  cancelButtonProps?: ButtonProps;
  width?: number | string;
}

export interface ConfigProviderDrawer {
  placement?: 'top' | 'right' | 'bottom' | 'left';
  mask?: boolean;
  maskClosable?: boolean;
  escToClose?: boolean;
  closable?: boolean;
  header?: boolean;
  footer?: boolean;
  titleEllipsisTooltip?: boolean | EllipsisTooltipProps;
  hideCancel?: boolean;
  okText?: string;
  cancelText?: string;
  okButtonProps?: ButtonProps;
  cancelButtonProps?: ButtonProps;
  width?: number | string;
  height?: number | string;
}

export interface ConfigProviderDatePicker {
  shortcuts?: ShortcutType[];
  shortcutsPosition?: 'left' | 'bottom' | 'right';
  previewShortcut?: boolean;
  showConfirmBtn?: boolean;
  showNowBtn?: boolean;
  dayStartOfWeek?: WeekStart;
  abbreviation?: boolean;
}

export interface ConfigProviderPagination {
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  showTotal?: boolean;
  showMore?: boolean;
  showJumper?: boolean;
  showPageSize?: boolean;
  autoAdjust?: boolean;
  baseSize?: number;
  bufferSize?: number;
  pageSizeProps?: PaginationSelectProps;
}

export interface ConfigProvider {
  slots: Slots;
  prefixCls?: string;
  locale?: SdLang;
  size?: Size;
  allowClear?: boolean;
  allowSearch?: boolean;
  virtualListProps?: VirtualListProps;
  autoInsertSpaceInButton?: boolean;
  updateAtScroll?: boolean;
  scrollToClose?: boolean;
  exchangeTime?: boolean;
  rtl?: boolean;
  datePicker?: ConfigProviderDatePicker;
  modal?: ConfigProviderModal;
  drawer?: ConfigProviderDrawer;
  pagination?: ConfigProviderPagination;
  jsonForm?: JsonFormProviderConfig;
  theme?: SDThemeNormalized;
}

export const configProviderInjectionKey: InjectionKey<ConfigProvider> = Symbol('SDConfigProvider');

export const themePopupContainerInjectionKey: InjectionKey<Ref<HTMLElement | null>> =
  Symbol('SDThemePopupContainer');
