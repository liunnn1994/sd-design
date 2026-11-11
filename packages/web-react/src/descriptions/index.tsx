import type { TextAlign } from '@sdata/web-core/_utils/constant';
import type { ResponsiveValue } from '@sdata/web-core/_utils/responsive';
import type { DescLayout } from '@sdata/web-core/descriptions/types';
import type { ComponentRef as ReactComponentRef } from 'react';
import type { ComponentPropsWithRef, CSSProperties, ReactNode } from 'react';

import {
  groupDescriptions,
  resolveDescriptionAlign,
} from '@sdata/web-core/descriptions/foundation';
import { Fragment, isValidElement } from 'react';

import { getRenderItems } from '../_shared/children.js';
import { useResponsiveState } from '../_shared/use-responsive-state.js';
import { useConfig, usePrefix } from '../config-provider/index.js';

export type { DescLayout } from '@sdata/web-core/descriptions/types';
export interface DescData {
  label: ReactNode | (() => ReactNode);
  value: ReactNode | (() => ReactNode);
  span?: number;
}
export interface DescriptionsItemProps {
  label?: ReactNode;
  span?: number;
  children?: ReactNode;
}
export function DescriptionsItem({ children }: DescriptionsItemProps) {
  return <>{children}</>;
}

export interface DescriptionsProps extends Omit<ComponentPropsWithRef<'div'>, 'title'> {
  data?: DescData[];
  column?: number | ResponsiveValue;
  title?: ReactNode;
  layout?: DescLayout;
  align?: TextAlign | { label?: TextAlign; value?: TextAlign };
  size?: 'mini' | 'small' | 'medium' | 'large';
  bordered?: boolean;
  labelStyle?: CSSProperties;
  valueStyle?: CSSProperties;
  tableLayout?: 'auto' | 'fixed';
  renderLabel?: (props: { label: DescData['label']; index: number; data: DescData }) => ReactNode;
  renderValue?: (props: { value: DescData['value']; index: number; data: DescData }) => ReactNode;
}

function DescriptionsRoot({
  data = [],
  column = 3,
  title,
  layout = 'horizontal',
  align = 'left',
  size,
  bordered = false,
  labelStyle,
  valueStyle,
  tableLayout = 'auto',
  renderLabel,
  renderValue,
  children,
  className,
  ...attrs
}: DescriptionsProps) {
  const prefix = usePrefix('descriptions');
  const config = useConfig();
  const columns = useResponsiveState(column, 3, true);
  const labelStyles = { textAlign: resolveDescriptionAlign(align, 'label'), ...labelStyle };
  const valueStyles = { textAlign: resolveDescriptionAlign(align, 'value'), ...valueStyle };
  const entries =
    children !== undefined
      ? getRenderItems(children).map(({ content, key }) => ({
          key,
          span: isValidElement<DescriptionsItemProps>(content) ? content.props.span : undefined,
          label: isValidElement<DescriptionsItemProps>(content) ? content.props.label : undefined,
          value: content,
        }))
      : data.map((item, index) => ({
          key: String(index),
          span: item.span,
          label:
            renderLabel?.({ label: item.label, index, data: item }) ??
            (typeof item.label === 'function' ? item.label() : item.label),
          value:
            renderValue?.({ value: item.value, index, data: item }) ??
            (typeof item.value === 'function' ? item.value() : item.value),
        }));
  const rows = groupDescriptions(
    entries,
    (item) => item.span,
    () => columns,
  );
  const cell = (part: 'label' | 'value', inline: boolean) =>
    `${prefix}-item-${part} ${prefix}-item-${part}-${inline ? 'inline' : 'block'}`;
  return (
    <div
      {...attrs}
      className={[
        prefix,
        `${prefix}-layout-${layout}`,
        `${prefix}-size-${size ?? config.size ?? 'medium'}`,
        bordered && `${prefix}-border`,
        tableLayout === 'fixed' && `${prefix}-table-layout-fixed`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {Boolean(title) && <div className={`${prefix}-title`}>{title}</div>}
      <div className={`${prefix}-body`}>
        <table className={`${prefix}-table`}>
          <tbody>
            {rows.map((row, rowIndex) =>
              layout === 'inline-horizontal' || layout === 'inline-vertical' ? (
                <tr key={rowIndex} className={`${prefix}-row`}>
                  {row.map((item) => (
                    <td key={item.data.key} className={`${prefix}-item`} colSpan={item.span}>
                      <div className={cell('label', true)} style={labelStyles}>
                        {item.data.label}
                      </div>
                      <div className={cell('value', true)} style={valueStyles}>
                        {item.data.value}
                      </div>
                    </td>
                  ))}
                </tr>
              ) : layout === 'vertical' ? (
                <Fragment key={rowIndex}>
                  <tr className={`${prefix}-row`}>
                    {row.map((item) => (
                      <td
                        key={item.data.key}
                        className={cell('label', false)}
                        style={labelStyles}
                        colSpan={item.span}
                      >
                        {item.data.label}
                      </td>
                    ))}
                  </tr>
                  <tr className={`${prefix}-row`}>
                    {row.map((item) => (
                      <td
                        key={item.data.key}
                        className={cell('value', false)}
                        style={valueStyles}
                        colSpan={item.span}
                      >
                        {item.data.value}
                      </td>
                    ))}
                  </tr>
                </Fragment>
              ) : (
                <tr key={rowIndex} className={`${prefix}-row`}>
                  {row.map((item) => (
                    <Fragment key={item.data.key}>
                      <td className={cell('label', false)} style={labelStyles}>
                        {item.data.label}
                      </td>
                      <td
                        className={cell('value', false)}
                        style={valueStyles}
                        colSpan={item.span * 2 - 1}
                      >
                        {item.data.value}
                      </td>
                    </Fragment>
                  ))}
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export const Descriptions = Object.assign(DescriptionsRoot, { DescriptionsItem });
export default Descriptions;

export type DescriptionsInstance = ReactComponentRef<typeof Descriptions>;
