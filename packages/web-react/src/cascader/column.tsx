import type { CascaderOptionInfo } from '@sdata/web-core/cascader/types';
import type { ComponentPropsWithRef, ReactNode } from 'react';

import { useContext } from 'react';

import type { VirtualListProps } from '../_shared/virtual-list.js';
import type { TagProps } from '../tag/index.js';

import { VirtualList } from '../_shared/virtual-list.js';
import { useConfig, usePrefix } from '../config-provider/index.js';
import { Empty } from '../empty/index.js';
import { Scrollbar } from '../scrollbar/index.js';
import { CascaderContext } from './context.js';
import { CascaderOptionView } from './option.js';

export interface CascaderColumnProps extends ComponentPropsWithRef<'div'> {
  column: CascaderOptionInfo<TagProps>[];
  level?: number;
  totalLevel: number;
  selectedPath: string[];
  activeKey?: string | undefined;
  multiple?: boolean | undefined;
  checkStrictly?: boolean | undefined;
  empty?: ReactNode;
  virtualListProps?:
    | Omit<VirtualListProps<CascaderOptionInfo<TagProps>>, 'items' | 'children'>
    | undefined;
}
export function CascaderColumn({
  column,
  level = 0,
  totalLevel,
  selectedPath,
  activeKey,
  multiple,
  checkStrictly,
  empty,
  virtualListProps,
  className,
  style,
  ...attrs
}: CascaderColumnProps) {
  const prefix = usePrefix('cascader');
  const config = useConfig();
  const context = useContext(CascaderContext);
  const renderOption = (option: CascaderOptionInfo<TagProps>) => (
    <CascaderOptionView
      key={option.key}
      option={option}
      active={selectedPath.includes(option.key) || activeKey === option.key}
      expanded={selectedPath.includes(option.key)}
      multiple={multiple}
      checkStrictly={checkStrictly}
    />
  );
  return (
    <div
      data-sd-cascader-column
      {...attrs}
      className={[
        `${prefix}-panel-column`,
        context.ellipsis !== false && `${prefix}-panel-column-ellipsis`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ zIndex: totalLevel - level, ...style }}
    >
      {column.length === 0 ? (
        <Scrollbar className={`${prefix}-column-content`}>
          <div className={`${prefix}-list-empty`}>
            {empty ?? config.renderEmpty?.({ component: 'cascader' }) ?? <Empty />}
          </div>
        </Scrollbar>
      ) : virtualListProps ? (
        <VirtualList key={column.length} {...virtualListProps} items={column}>
          {({ item }) => renderOption(item)}
        </VirtualList>
      ) : (
        <Scrollbar className={`${prefix}-column-content`}>
          <ul
            role="menu"
            className={[
              `${prefix}-list`,
              multiple && `${prefix}-list-multiple`,
              checkStrictly && `${prefix}-list-strictly`,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {column.map(renderOption)}
          </ul>
        </Scrollbar>
      )}
    </div>
  );
}
