import type { ColResponsiveConfig } from '../_utils/responsive.js';

import { isNull, isNumber, isObject, isString, isUndefined } from '../_utils/is.js';
export type FlexType = number | string | 'initial' | 'auto' | 'none';
export interface GridColumnProps {
  readonly span: number;
  readonly offset?: number | undefined;
  readonly order?: number | undefined;
  readonly xs?: number | ColResponsiveConfig | undefined;
  readonly sm?: number | ColResponsiveConfig | undefined;
  readonly md?: number | ColResponsiveConfig | undefined;
  readonly lg?: number | ColResponsiveConfig | undefined;
  readonly xl?: number | ColResponsiveConfig | undefined;
  readonly xxl?: number | ColResponsiveConfig | undefined;
}
export interface GridColumnContext {
  readonly div?: boolean | undefined;
  readonly gutter?: readonly [number, number] | undefined;
}
export function getAllowableFlexValue(flexValue: FlexType | undefined) {
  if (
    (isString(flexValue) &&
      (['initial', 'auto', 'none'].includes(flexValue) || /^\d+$/.test(flexValue))) ||
    isNumber(flexValue)
  ) {
    return flexValue;
  }
  if (isString(flexValue) && /^\d+(px|em|rem|%)$/.test(flexValue)) {
    return `0 0 ${flexValue}`;
  }
  return undefined;
}
// 数字断点值 0 是合法配置，必须用显式 undefined/null 判断。
export const hasBreakpointValue = (value: unknown): boolean =>
  !isUndefined(value) && !isNull(value);
export function getGridColumnClassNames(
  prefixCls: string,
  props: GridColumnProps,
  rowContext: GridColumnContext,
) {
  const { div } = rowContext;
  const { span, offset, order, xs, sm, md, lg, xl, xxl } = props;
  const result = {
    [`${prefixCls}`]: !div,
    [`${prefixCls}-order-${order}`]: order,
    [`${prefixCls}-${span}`]:
      !div &&
      !hasBreakpointValue(xs) &&
      !hasBreakpointValue(sm) &&
      !hasBreakpointValue(md) &&
      !hasBreakpointValue(lg) &&
      !hasBreakpointValue(xl) &&
      !hasBreakpointValue(xxl),
    [`${prefixCls}-offset-${offset}`]: offset && offset > 0,
  };

  const screenList: {
    [key: string]: number | ColResponsiveConfig | undefined;
  } = { xs, sm, md, lg, xl, xxl };

  Object.keys(screenList).forEach((screen) => {
    const screenValue = screenList[screen];
    if (hasBreakpointValue(screenValue) && isNumber(screenValue)) {
      result[`${prefixCls}-${screen}-${screenValue}`] = true;
    } else if (hasBreakpointValue(screenValue) && isObject(screenValue)) {
      result[`${prefixCls}-${screen}-${screenValue.span}`] = screenValue.span;
      result[`${prefixCls}-${screen}-offset-${screenValue.offset}`] = hasBreakpointValue(
        screenValue.offset,
      );
      result[`${prefixCls}-${screen}-order-${screenValue.order}`] = hasBreakpointValue(
        screenValue.order,
      );
    }
  });

  return result;
}
export function getGridColumnPadding(rowContext: GridColumnContext) {
  const { gutter, div } = rowContext;
  const result: {
    paddingLeft?: string;
    paddingRight?: string;
    paddingTop?: string;
    paddingBottom?: string;
  } = {};
  if (Array.isArray(gutter) && !div) {
    const paddingHorizontal = (gutter[0] && gutter[0] / 2) || 0;
    const paddingVertical = (gutter[1] && gutter[1] / 2) || 0;
    if (paddingHorizontal) {
      result.paddingLeft = `${paddingHorizontal}px`;
      result.paddingRight = `${paddingHorizontal}px`;
    }
    if (paddingVertical) {
      result.paddingTop = `${paddingVertical}px`;
      result.paddingBottom = `${paddingVertical}px`;
    }
  }

  return result;
}
