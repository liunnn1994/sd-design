import type { ResponsiveValue, ColResponsiveConfig } from '@sdata/web-core/_utils/responsive';
export type { ResponsiveValue, ColResponsiveConfig } from '@sdata/web-core/_utils/responsive';
export type FlexType = number | string | 'initial' | 'auto' | 'none';

export interface RowProps {
  gutter?: number | ResponsiveValue | [number | ResponsiveValue, number | ResponsiveValue];
  justify?: 'start' | 'center' | 'end' | 'space-around' | 'space-between';
  align?: 'start' | 'center' | 'end' | 'stretch';
  div?: boolean;
  wrap?: boolean;
}

export interface ColProps {
  span?: number;
  offset?: number | undefined;
  order?: number | undefined;
  xs?: number | ColResponsiveConfig | undefined;
  sm?: number | ColResponsiveConfig | undefined;
  md?: number | ColResponsiveConfig | undefined;
  lg?: number | ColResponsiveConfig | undefined;
  xl?: number | ColResponsiveConfig | undefined;
  xxl?: number | ColResponsiveConfig | undefined;
  flex?: number | string | 'initial' | 'auto' | 'none' | undefined;
}

export interface GridProps {
  cols?: number | ResponsiveValue;
  rowGap?: number | ResponsiveValue;
  colGap?: number | ResponsiveValue;
  collapsed?: boolean;
  collapsedRows?: number;
}

export interface GridItemProps {
  span?: number | ResponsiveValue;
  offset?: number | ResponsiveValue;
  suffix?: boolean;
}

export interface GridItemData extends GridItemProps {
  span: number;
  offset: number;
}
