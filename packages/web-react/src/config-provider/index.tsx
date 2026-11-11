import type { SdLang } from '@sdata/web-core/locale/types';
import type { NoticeConfig } from '@sdata/web-core/notice/types';
import type { HTMLAttributes, ReactNode } from 'react';

import { resolvePrefixCls } from '@sdata/web-core/config/prefix';
import { createContext, useContext } from 'react';

import type { VirtualListProps } from '../_shared/virtual-list.js';
import type { PickerProps } from '../date-picker/picker.js';
import type { DrawerProps } from '../drawer/index.js';
import type { JsonFormProviderConfig } from '../json-form/types.js';
import type { ModalProviderConfig } from '../modal/types.js';
import type { PaginationConfig } from '../pagination/types.js';
import type { SpinProps } from '../spin/index.js';
import type { TableProps } from '../table/types.js';
import type { ThemeProviderProps } from './theme-provider.js';

import { ThemeProvider } from './theme-provider.js';
export { ThemeProvider } from './theme-provider.js';
export type { ThemeProviderProps } from './theme-provider.js';
export type {
  SdThemeMeta,
  ThemeTokenMap,
  ThemeTokenValue,
} from '@sdata/web-core/config-provider/theme';
export type { SdThemeSeed } from '@sdata/web-core/config-provider/algorithms';
export type ConfigProviderTable = NonNullable<ConfigProviderProps['table']>;

interface ConfigProviderOptions extends Pick<ThemeProviderProps, 'theme' | 'themeMode' | 'global'> {
  prefixCls?: string;
  size?: 'mini' | 'small' | 'medium' | 'large';
  modal?: ModalProviderConfig;
  pagination?: PaginationConfig;
  table?: Pick<
    TableProps,
    | 'bordered'
    | 'hoverable'
    | 'stripe'
    | 'tableLayoutFixed'
    | 'pagination'
    | 'pagePosition'
    | 'indentSize'
    | 'showHeader'
    | 'filterIconAlignLeft'
    | 'hideExpandButtonOnEmpty'
    | 'columnResizable'
    | 'summaryText'
    | 'stickyHeader'
    | 'scrollbar'
    | 'showEmptyTree'
  >;
  tableSpinProps?: SpinProps;
  toolbarSpinProps?: SpinProps;
  basicCrudTableSpinProps?: SpinProps;
  jsonForm?: JsonFormProviderConfig;
  allowClear?: boolean;
  allowSearch?: boolean;
  exchangeTime?: boolean;
  datePicker?: Pick<
    PickerProps,
    | 'shortcuts'
    | 'shortcutsPosition'
    | 'previewShortcut'
    | 'showConfirmBtn'
    | 'showNowBtn'
    | 'dayStartOfWeek'
    | 'abbreviation'
  >;
  virtualListProps?: Omit<VirtualListProps<unknown>, 'children' | 'items'>;
  selectSpinProps?: SpinProps;
  cascaderSpinProps?: SpinProps;
  treeSelectSpinProps?: SpinProps;
  rtl?: boolean;
  updateAtScroll?: boolean;
  scrollToClose?: boolean;
  autoInsertSpaceInButton?: boolean;
  locale?: SdLang;
  message?: Pick<NoticeConfig, 'deduplicate' | 'deduplicateByType'>;
  notification?: Pick<NoticeConfig, 'deduplicate' | 'deduplicateByType'>;
  renderEmpty?: (context: { component: string }) => ReactNode;
  spinProps?: SpinProps;
  cardSpinProps?: SpinProps;
  listSpinProps?: SpinProps;
  qrCodeSpinProps?: SpinProps;
  timelineSpinProps?: SpinProps;
  drawer?: Pick<
    DrawerProps,
    | 'placement'
    | 'mask'
    | 'maskClosable'
    | 'escToClose'
    | 'closable'
    | 'header'
    | 'footer'
    | 'hideCancel'
    | 'okText'
    | 'cancelText'
    | 'okButtonProps'
    | 'cancelButtonProps'
    | 'titleEllipsisTooltip'
    | 'width'
    | 'height'
  >;
  renderLoading?: () => ReactNode;
  colorPicker?: { swatchColors?: string[] | null };
  children?: ReactNode;
}

export interface ConfigProviderProps extends ConfigProviderOptions, HTMLAttributes<HTMLElement> {}

const configKeys = {
  prefixCls: true,
  size: true,
  modal: true,
  pagination: true,
  table: true,
  tableSpinProps: true,
  toolbarSpinProps: true,
  basicCrudTableSpinProps: true,
  jsonForm: true,
  allowClear: true,
  allowSearch: true,
  exchangeTime: true,
  datePicker: true,
  virtualListProps: true,
  selectSpinProps: true,
  cascaderSpinProps: true,
  treeSelectSpinProps: true,
  rtl: true,
  updateAtScroll: true,
  scrollToClose: true,
  autoInsertSpaceInButton: true,
  locale: true,
  message: true,
  notification: true,
  renderEmpty: true,
  spinProps: true,
  cardSpinProps: true,
  listSpinProps: true,
  qrCodeSpinProps: true,
  timelineSpinProps: true,
  drawer: true,
  renderLoading: true,
  colorPicker: true,
} satisfies Record<
  Exclude<keyof ConfigProviderOptions, 'theme' | 'themeMode' | 'global' | 'children'>,
  true
>;

const ConfigContext = createContext<Omit<ConfigProviderOptions, 'children'>>({});

export function ConfigProvider({
  children,
  theme,
  themeMode,
  global,
  ...options
}: ConfigProviderProps) {
  const parent = useContext(ConfigContext);
  const entries = Object.entries(options);
  const config = Object.fromEntries(
    entries.filter(([key]) => Object.hasOwn(configKeys, key)),
  ) as Omit<ConfigProviderOptions, 'children'>;
  const attrs = Object.fromEntries(
    entries.filter(([key]) => !Object.hasOwn(configKeys, key)),
  ) as HTMLAttributes<HTMLElement>;
  return (
    <ConfigContext.Provider value={{ ...parent, ...config }}>
      <ThemeProvider {...attrs} theme={theme} themeMode={themeMode} global={global}>
        {children}
      </ThemeProvider>
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  return useContext(ConfigContext);
}

export function usePrefix(componentName: string) {
  const config = useConfig();
  return resolvePrefixCls(componentName, {
    providerPrefix: config.prefixCls,
    globalPrefix: undefined,
    appPrefix: undefined,
  });
}

export default ConfigProvider;
