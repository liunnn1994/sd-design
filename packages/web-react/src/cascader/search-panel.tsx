import type { CascaderOptionInfo } from '@sdata/web-core/cascader/types';
import type { ReactNode } from 'react';

import type { ScrollbarProps } from '../scrollbar/index.js';
import type { SpinProps } from '../spin/index.js';
import type { TagProps } from '../tag/index.js';

import { useConfig, usePrefix } from '../config-provider/index.js';
import { Empty } from '../empty/index.js';
import { Scrollbar } from '../scrollbar/index.js';
import { Spin } from '../spin/index.js';
import { CascaderOptionView } from './option.js';

export interface CascaderSearchPanelProps extends ScrollbarProps {
  options: CascaderOptionInfo<TagProps>[];
  loading?: boolean;
  spinProps?: SpinProps;
  activeKey?: string | undefined;
  multiple?: boolean;
  checkStrictly?: boolean;
  pathLabel?: boolean;
  empty?: ReactNode;
}
export function CascaderSearchPanel({
  options,
  loading,
  spinProps,
  activeKey,
  multiple,
  checkStrictly,
  pathLabel,
  empty,
  className,
  ...attrs
}: CascaderSearchPanelProps) {
  const prefix = usePrefix('cascader');
  const config = useConfig();
  return (
    <Scrollbar
      {...attrs}
      className={[`${prefix}-panel`, `${prefix}-search-panel`, className].filter(Boolean).join(' ')}
    >
      {loading ? (
        <Spin {...spinProps} />
      ) : options.length === 0 ? (
        <div className={`${prefix}-list-empty`}>
          {empty ?? config.renderEmpty?.({ component: 'cascader' }) ?? <Empty />}
        </div>
      ) : (
        <ul
          role="menu"
          className={[
            `${prefix}-list`,
            `${prefix}-search-list`,
            multiple && `${prefix}-list-multiple`,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {options.map((option) => (
            <CascaderOptionView
              key={option.key}
              className={`${prefix}-search-option`}
              option={option}
              active={option.key === activeKey}
              multiple={multiple}
              checkStrictly={checkStrictly}
              pathLabel={pathLabel}
              searchOption
            />
          ))}
        </ul>
      )}
    </Scrollbar>
  );
}
