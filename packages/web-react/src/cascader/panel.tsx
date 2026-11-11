import type { CascaderLoader } from '@sdata/web-core/cascader/lazy-load';
import type {
  CascaderFieldNames,
  CascaderOption,
  CascaderOptionInfo,
} from '@sdata/web-core/cascader/types';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import { createCascaderKeyboard } from '@sdata/web-core/cascader/keyboard';

import type { TagProps } from '../tag/index.js';
import type { CascaderSelectionProps } from './use-selection.js';

import { CascaderBasePanel } from './base-panel.js';
import { CascaderContext } from './context.js';
import { useCascaderOptions } from './use-options.js';
import { useCascaderSelectedPath } from './use-selected-path.js';
import { useCascaderSelection } from './use-selection.js';

export interface CascaderPanelProps
  extends
    CascaderSelectionProps,
    Omit<ComponentPropsWithoutRef<'div'>, 'onChange' | 'defaultValue'> {
  options?: CascaderOption<TagProps>[];
  fieldNames?: CascaderFieldNames;
  loadMore?: CascaderLoader<TagProps>;
  expandTrigger?: 'click' | 'hover';
  expandChild?: boolean;
  ellipsis?: boolean | 'performant-ellipsis';
  empty?: ReactNode;
  renderOption?(option: CascaderOptionInfo<TagProps>): ReactNode;
}
export function CascaderPanel({
  options,
  fieldNames,
  loadMore,
  expandTrigger = 'click',
  expandChild = false,
  ellipsis = true,
  empty,
  renderOption,
  value,
  defaultValue,
  multiple,
  pathMode,
  checkStrictly,
  readonly,
  valueKey,
  onValueChange,
  onChange,
  onKeyDown,
  ...attrs
}: CascaderPanelProps) {
  const data = useCascaderOptions({ options, fieldNames, loadMore, checkStrictly, valueKey });
  const path = useCascaderSelectedPath({
    ...data,
    expandChild,
    filteredOptions: [...(checkStrictly ? data.optionMap.values() : data.leafOptionSet)],
  });
  const selection = useCascaderSelection(
    {
      value,
      defaultValue,
      multiple,
      pathMode,
      checkStrictly,
      readonly,
      valueKey,
      onValueChange,
      onChange,
    },
    { ...data, ...path },
  );
  const keydown = createCascaderKeyboard({
    getPopupVisible: () => true,
    getActiveOption: () => path.activeOption,
    getCheckStrictly: () => !!checkStrictly,
    getValues: () => selection.valueMap,
    getSearchPanel: () => false,
    next: path.getNextActiveNode,
    load: data.loadOption,
    select: selection.foundation.click,
    setSelectedPath: path.setSelectedPath,
    setActiveKey: path.setActiveKey,
  });
  return (
    <CascaderContext
      value={{
        valueMap: selection.valueMap,
        onClickOption: selection.foundation.click,
        setActiveKey: path.setActiveKey,
        setSelectedPath: path.setSelectedPath,
        loadOption: data.loadOption,
        isLoading: data.isLoading,
        expandTrigger,
        ellipsis,
        renderOption,
      }}
    >
      <CascaderBasePanel
        {...attrs}
        displayColumns={path.displayColumns}
        selectedPath={path.selectedPath}
        activeKey={path.activeKey}
        totalLevel={data.totalLevel}
        multiple={multiple}
        checkStrictly={checkStrictly}
        empty={empty}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (!event.defaultPrevented && !event.nativeEvent.isComposing) keydown(event.key, event);
        }}
      />
    </CascaderContext>
  );
}
