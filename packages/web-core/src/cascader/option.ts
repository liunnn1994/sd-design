import type { CascaderOption, CascaderOptionInfo, CascaderSingleValue } from './types.js';

import { getCheckedStatus as resolveCheckedStatus, getOptionLabel } from './data.js';

export interface CascaderOptionCheckedStatus {
  checked: boolean | undefined;
  indeterminate: boolean;
}
export interface CascaderOptionState<P = unknown> {
  readonly option: CascaderOptionInfo<P>;
  readonly checkStrictly: boolean;
  readonly multiple: boolean;
  readonly checkedStatus: CascaderOptionCheckedStatus;
}
export interface CascaderOptionContext<P = unknown> {
  onClickOption: (option: CascaderOptionInfo<P>, checked?: boolean) => void;
  setActiveKey: (key?: string) => void;
  setSelectedPath: (key?: string) => void;
  loadOption: (option: CascaderOptionInfo<P>) => void;
  isLoading: (option: CascaderOptionInfo<P>) => boolean;
  formatLabel: (options: CascaderOption<P>[]) => string;
  separator: string;
  valueMap: Map<string, CascaderSingleValue>;
  expandTrigger: 'click' | 'hover';
}
export function createCascaderOptionFoundation<P = unknown>(
  state: CascaderOptionState<P>,
  context: Partial<CascaderOptionContext<P>>,
) {
  const getIsLoading = () => context.isLoading?.(state.option) ?? false;
  const getCheckedStatus = () => {
    if (state.checkStrictly) {
      return {
        checked: context.valueMap?.has(state.option.key),
        indeterminate: false,
      };
    }
    return resolveCheckedStatus(state.option, context.valueMap);
  };
  const getPathOptionLabel = () =>
    context.formatLabel?.(state.option.path.map((item) => item.raw)) ??
    getOptionLabel(state.option, { separator: context.separator });
  function handlePathChange() {
    context.loadOption?.(state.option);
    context.setSelectedPath?.(state.option.key);
  }

  function handleMouseenter() {
    if (state.option.disabled) return;
    context.setActiveKey?.(state.option.key);
    if (context.expandTrigger === 'hover') {
      handlePathChange();
    }
  }

  function handleMouseleave() {
    if (!state.option.disabled) {
      context.setActiveKey?.();
    }
  }

  function handleClick() {
    if (state.option.disabled) return;
    if (context.expandTrigger !== 'hover') {
      handlePathChange();
    }
    if (state.option.isLeaf && !state.multiple) {
      context.onClickOption?.(state.option);
    }
  }

  function handleCheckboxChange(_value: unknown, event: Event) {
    event.stopPropagation();
    handlePathChange();
    context.onClickOption?.(state.option, !state.checkedStatus.checked);
  }

  function handleRadioChange(_value: unknown, event: Event) {
    event.stopPropagation();
    handlePathChange();
    context.onClickOption?.(state.option, true);
  }
  return {
    getIsLoading,
    getCheckedStatus,
    getPathOptionLabel,
    handleMouseenter,
    handleMouseleave,
    handleClick,
    handleCheckboxChange,
    handleRadioChange,
  };
}
