import type { CascaderOptionInfo } from '@sdata/web-core/cascader/types';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import { runCssTransition } from '@sdata/web-core/transition/css';
import { AnimatePresence, usePresence } from 'framer-motion';
import { useLayoutEffect, useRef } from 'react';

import type { SpinProps } from '../spin/index.js';
import type { TagProps } from '../tag/index.js';
import type { CascaderColumnProps } from './column.js';

import { useConfig, usePrefix } from '../config-provider/index.js';
import { Empty } from '../empty/index.js';
import { Spin } from '../spin/index.js';
import { CascaderColumn } from './column.js';

export interface CascaderBasePanelProps extends ComponentPropsWithoutRef<'div'> {
  displayColumns: CascaderOptionInfo<TagProps>[][];
  selectedPath: string[];
  activeKey?: string | undefined;
  totalLevel: number;
  multiple?: boolean | undefined;
  checkStrictly?: boolean | undefined;
  loading?: boolean;
  spinProps?: SpinProps;
  dropdown?: boolean;
  empty?: ReactNode;
  virtualListProps?: CascaderColumnProps['virtualListProps'];
}
function TransitionColumn({ animate, ...props }: CascaderColumnProps & { animate: boolean }) {
  const element = useRef<HTMLDivElement>(null);
  const animateOnMount = useRef(animate).current;
  const hasLeft = useRef(false);
  const [present, remove] = usePresence();
  useLayoutEffect(() => {
    if (!present) hasLeft.current = true;
    if (!element.current || (present && !animateOnMount && !hasLeft.current)) return;
    return runCssTransition(element.current, {
      name: 'cascader-slide',
      enter: present,
      finish: () => {
        if (!present) remove?.();
      },
    });
  }, [present, remove, animateOnMount]);
  return <CascaderColumn {...props} ref={element} />;
}
export function CascaderBasePanel({
  displayColumns,
  selectedPath,
  activeKey,
  totalLevel,
  multiple,
  checkStrictly,
  loading,
  spinProps,
  dropdown,
  empty,
  virtualListProps,
  className,
  ...attrs
}: CascaderBasePanelProps) {
  const prefix = usePrefix('cascader');
  const config = useConfig();
  const mounted = useRef(false);
  useLayoutEffect(() => {
    mounted.current = true;
  }, []);
  return (
    <div
      {...attrs}
      className={[`${prefix}-panel`, dropdown && `${prefix}-dropdown-panel`, className]
        .filter(Boolean)
        .join(' ')}
    >
      {loading ? (
        <div className={`${prefix}-panel-column ${prefix}-panel-column-loading`}>
          <Spin {...spinProps} />
        </div>
      ) : displayColumns.length === 0 ? (
        <div className={`${prefix}-panel-column`}>
          <div className={`${prefix}-list-empty`}>
            {empty ?? config.renderEmpty?.({ component: 'cascader' }) ?? <Empty />}
          </div>
        </div>
      ) : null}
      <AnimatePresence>
        {!loading &&
          displayColumns.map((column, level) => (
            <TransitionColumn
              key={level}
              animate={mounted.current}
              column={column}
              level={level}
              totalLevel={totalLevel}
              selectedPath={selectedPath}
              activeKey={activeKey}
              multiple={multiple}
              checkStrictly={checkStrictly}
              empty={empty}
              virtualListProps={virtualListProps}
            />
          ))}
      </AnimatePresence>
    </div>
  );
}
