import type { ElementType, HTMLAttributes, ReactElement, ReactNode, Ref } from 'react';

import type { TableDataWithRaw } from './types.js';
import type { TableRowRenderData } from './types.js';

import { usePrefix } from '../config-provider/index.js';
import { useTableRoot } from './use-root.js';

export interface TableRowGroupProps extends HTMLAttributes<HTMLElement> {
  ref?: Ref<HTMLElement>;
  component?: ElementType | undefined;
  children?: ReactNode;
}
export interface TheadProps extends TableRowGroupProps {
  renderThead?: (() => ReactElement) | undefined;
}
export interface TbodyProps extends TableRowGroupProps {
  renderTbody?: (() => ReactElement) | undefined;
}
export function Thead({ component = 'div', renderThead, className, ...props }: TheadProps) {
  const prefix = usePrefix('table');
  return useTableRoot(component, renderThead?.(), {
    ...props,
    className: [`${prefix}-thead`, className].filter(Boolean).join(' '),
    role: 'rowgroup',
  });
}
export function Tbody({ component = 'div', renderTbody, className, ...props }: TbodyProps) {
  const prefix = usePrefix('table');
  return useTableRoot(component, renderTbody?.(), {
    ...props,
    className: [`${prefix}-tbody`, className].filter(Boolean).join(' '),
    role: 'rowgroup',
  });
}
export interface TrProps extends TableRowGroupProps {
  expand?: boolean;
  empty?: boolean;
  checked?: boolean;
  rowIndex?: number;
  record?: TableDataWithRaw;
  renderTr?: ((data: TableRowRenderData) => ReactElement) | undefined;
}
export function Tr({
  component = 'div',
  expand = false,
  empty = false,
  checked = false,
  rowIndex,
  record,
  renderTr,
  className,
  ...props
}: TrProps) {
  const prefix = usePrefix('table');
  return useTableRoot(component, renderTr?.({ rowIndex, record: record?.raw }), {
    ...props,
    className: [
      `${prefix}-tr`,
      expand && `${prefix}-tr-expand`,
      empty && `${prefix}-tr-empty`,
      checked && `${prefix}-tr-checked`,
      className,
    ]
      .filter(Boolean)
      .join(' '),
    role: 'row',
  });
}
