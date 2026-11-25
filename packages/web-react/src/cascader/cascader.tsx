import type {
  CascaderOption,
  CascaderSingleValue,
  CascaderModelValue,
} from '@sdata/web-core/cascader/types';
import type { ReactNode, Ref } from 'react';

import { createCascaderKeyboard } from '@sdata/web-core/cascader/keyboard';
import { filterCascaderOptions, getCascaderViewValues } from '@sdata/web-core/cascader/values';
import {
  resolveAllowClear,
  resolveAllowSearch,
  resolveDropdownVirtualList,
} from '@sdata/web-core/config/prop-values';
import { resolveDropdownVirtualListProps } from '@sdata/web-core/select/virtual-dropdown';
import {
  createCompatTriggerFoundation,
  getDefaultPopupVisible,
} from '@sdata/web-core/trigger/compat-state';
import { useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';

import type { SelectViewProps } from '../_shared/select-view.js';
import type { InputTagInstance } from '../input-tag/index.js';
import type { SpinProps } from '../spin/index.js';
import type { TagProps } from '../tag/index.js';
import type { TriggerProps } from '../trigger/index.js';
import type { CascaderColumnProps } from './column.js';
import type { CascaderPanelProps } from './panel.js';

import { SelectView } from '../_shared/select-view.js';
import { useReadonlyTip } from '../_shared/use-readonly-tip.js';
import { useConfig, usePrefix } from '../config-provider/index.js';
import { useFormItem } from '../form/context.js';
import { Tooltip } from '../tooltip/index.js';
import { Trigger } from '../trigger/index.js';
import { CascaderBasePanel } from './base-panel.js';
import { CascaderContext } from './context.js';
import { CascaderSearchPanel } from './search-panel.js';
import { useCascaderInteraction } from './use-interaction.js';
import { useCascaderOptions } from './use-options.js';
import { useCascaderSelectedPath } from './use-selected-path.js';
import { useCascaderSelection } from './use-selection.js';

export interface CascaderTriggerState {
  value: CascaderModelValue;
  displayValue: string | string[];
  inputValue: string;
  selectedOptions: CascaderOption<TagProps>[];
  selectedPaths: CascaderOption<TagProps>[][];
  popupVisible: boolean;
  disabled: boolean;
  loading: boolean;
  multiple: boolean;
}
export interface CascaderInstance {
  focus(): void;
  blur(): void;
}
export interface CascaderProps
  extends
    Omit<
      SelectViewProps,
      | 'value'
      | 'ref'
      | 'onRemove'
      | 'onClear'
      | 'onChange'
      | 'defaultValue'
      | 'opened'
      | 'multiple'
      | 'children'
      | 'onInputValueChange'
    >,
    Pick<
      CascaderPanelProps,
      | 'value'
      | 'defaultValue'
      | 'options'
      | 'fieldNames'
      | 'loadMore'
      | 'expandTrigger'
      | 'expandChild'
      | 'ellipsis'
      | 'empty'
      | 'renderOption'
      | 'multiple'
      | 'pathMode'
      | 'checkStrictly'
      | 'valueKey'
      | 'onValueChange'
      | 'onChange'
    > {
  ref?: Ref<CascaderInstance>;
  defaultInputValue?: string;
  onInputValueChange?(value: string): void;
  readonly?: boolean | string;
  filterable?: boolean;
  clearable?: boolean;
  popupVisible?: boolean;
  defaultPopupVisible?: boolean;
  show?: boolean;
  defaultShow?: boolean;
  onPopupVisibleChange?(visible: boolean): void;
  onShowChange?(visible: boolean): void;
  filterOption?(input: string, option: CascaderOption<TagProps>): boolean;
  popupContainer?: TriggerProps['popupContainer'];
  triggerProps?: Omit<TriggerProps, 'children' | 'content'>;
  floatingOptions?: TriggerProps['floatingOptions'];
  showPath?: boolean;
  separator?: string;
  formatLabel?(options: CascaderOption<TagProps>[]): string;
  spinProps?: SpinProps;
  searchOptionOnlyLabel?: boolean;
  searchDelay?: number;
  fallback?: boolean | ((value: CascaderSingleValue) => string);
  virtualListProps?: CascaderColumnProps['virtualListProps'];
  renderTrigger?(state: CascaderTriggerState): ReactNode;
  onSearch?(value: string): void;
  onClear?(): void;
}
export function Cascader(props: CascaderProps) {
  const {
    value,
    defaultValue,
    options,
    fieldNames,
    loadMore,
    expandTrigger = 'click',
    expandChild = false,
    ellipsis = true,
    empty,
    renderOption,
    multiple = false,
    pathMode,
    checkStrictly = false,
    valueKey,
    onValueChange,
    onChange,
    readonly,
    filterable,
    clearable,
    allowSearch,
    allowClear,
    popupVisible,
    defaultPopupVisible,
    show,
    defaultShow,
    onPopupVisibleChange,
    onShowChange,
    filterOption,
    popupContainer,
    triggerProps,
    floatingOptions,
    showPath = true,
    separator = ' / ',
    formatLabel,
    spinProps,
    searchOptionOnlyLabel,
    searchDelay = 500,
    fallback = true,
    virtualListProps,
    renderTrigger,
    onSearch,
    onClear,
    inputValue,
    defaultInputValue = '',
    onInputValueChange,
    loading = false,
    ref,
    onKeyDown,
    onFocus,
    onBlur,
    inputAttrs,
    className,
    style,
    fitWidth = false,
    maxWFull = true,
    ...viewProps
  } = props;
  const config = useConfig();
  const resolvedSpinProps = { ...config.cascaderSpinProps, ...spinProps };
  const prefix = usePrefix('cascader');
  const form = useFormItem(props);
  const tip = useReadonlyTip(readonly, form.mergedDisabled);
  const view = useRef<InputTagInstance>(null);
  const host = useRef<HTMLSpanElement>(null);
  const [target, setTarget] = useState<HTMLElement | null>(null);
  useLayoutEffect(() => {
    const next = renderTrigger ? host.current : host.current?.firstElementChild;
    const element = next instanceof HTMLElement ? next : null;
    if (element !== target) setTarget(element);
  });
  useImperativeHandle(
    ref,
    () => ({ focus: () => view.current?.focus(), blur: () => view.current?.blur() }),
    [],
  );
  const [localVisible, setLocalVisible] = useState(
    getDefaultPopupVisible({ defaultPopupVisible, defaultShow }),
  );
  const visible = popupVisible ?? show ?? localVisible;
  const popup = createCompatTriggerFoundation(
    {
      defaultPopupVisible,
      defaultShow,
      popupVisible,
      show,
      visible,
      get localVisible() {
        return localVisible;
      },
      set localVisible(next) {
        setLocalVisible(next);
      },
    },
    (event, next) => {
      if (event === 'update:popupVisible') onPopupVisibleChange?.(next);
      if (event === 'update:show') onShowChange?.(next);
    },
  );
  const requestVisible = (next: boolean) => {
    if (next && form.mergedDisabled) return;
    if (next && readonly) {
      tip.show();
      return;
    }
    popup.handlePopupVisibleChange(next);
  };
  const mergedSearch = resolveAllowSearch({
    hasLocalProp: Object.hasOwn(props, 'allowSearch'),
    hasCompatProp: Object.hasOwn(props, 'filterable'),
    localValue: allowSearch,
    compatValue: filterable,
    globalValue: config.allowSearch,
    defaultValue: multiple,
  });
  const mergedClear = resolveAllowClear({
    hasLocalProp: Object.hasOwn(props, 'allowClear') || Object.hasOwn(props, 'clearable'),
    localValue: Object.hasOwn(props, 'allowClear') ? allowClear : clearable,
    globalValue: config.allowClear,
  });
  const mergedVirtual = resolveDropdownVirtualList<CascaderProps['virtualListProps']>({
    hasLocalProp: Object.hasOwn(props, 'virtualListProps'),
    localValue: virtualListProps,
    globalValue: config.virtualListProps,
  });
  const virtual = resolveDropdownVirtualListProps(mergedVirtual, triggerProps, 36);
  const data = useCascaderOptions({ options, fieldNames, loadMore, checkStrictly, valueKey });
  const interaction = useCascaderInteraction<TagProps>(
    {
      inputValue,
      defaultInputValue,
      popupVisible: visible,
      allowSearch: !!mergedSearch,
      searchDelay,
      onInputValueChange,
      onSearch,
      onClear,
    },
    {
      getValues: (): Map<string, CascaderSingleValue> => selection.valueMap,
      getLeafOptions: () => data.leafOptionMap,
      getActiveKey: (): string | undefined => path.activeKey,
      setPopupVisible: requestVisible,
      setSelectedPath: (key) => path.setSelectedPath(key),
      setActiveKey: (key) => path.setActiveKey(key),
      clearSelection: (): boolean => selection.foundation.clear(),
    },
  );
  const filtered = filterCascaderOptions(
    [...(checkStrictly ? data.optionMap.values() : data.leafOptionSet)],
    interaction.inputValue,
    checkStrictly,
    filterOption,
  );
  const path = useCascaderSelectedPath({
    ...data,
    filteredOptions: filtered,
    showSearchPanel: interaction.showSearchPanel,
    expandChild,
  });
  const selection = useCascaderSelection(
    {
      value,
      defaultValue,
      multiple,
      pathMode,
      checkStrictly,
      readonly: !!readonly || form.mergedDisabled,
      valueKey,
      onValueChange,
      onChange,
    },
    {
      ...data,
      ...path,
      onReadonly: tip.show,
      onFormChange: () => form.eventHandlers?.onChange?.(),
      afterSingleSelect: () => requestVisible(false),
      afterMultipleSelect: () => interaction.inputChange('', 'optionChecked'),
    },
  );
  const keyboard = createCascaderKeyboard({
    getPopupVisible: () => visible,
    getActiveOption: () => path.activeOption,
    getCheckStrictly: () => checkStrictly,
    getValues: () => selection.valueMap,
    getSearchPanel: () => interaction.showSearchPanel,
    next: path.getNextActiveNode,
    load: data.loadOption,
    select: selection.foundation.click,
    setSelectedPath: path.setSelectedPath,
    setActiveKey: path.setActiveKey,
    setPopupVisible: requestVisible,
  });
  const selected = getCascaderViewValues(selection.valueMap, data.leafOptionMap, {
    showPath,
    separator,
    formatLabel,
    fallback,
  });
  const selectedPaths = [...selection.valueMap.keys()].flatMap((key) => {
    const option = data.leafOptionMap.get(key);
    return option ? [option.path.map((part) => part.raw)] : [];
  });
  const values = [...selection.valueMap.values()];
  const triggerState: CascaderTriggerState = {
    value: multiple ? values : (values[0] ?? ''),
    displayValue: multiple ? selected.map((item) => item.label) : (selected[0]?.label ?? ''),
    inputValue: interaction.inputValue,
    selectedPaths,
    selectedOptions: selectedPaths.map((items) => items.at(-1)!),
    popupVisible: visible,
    disabled: form.mergedDisabled,
    loading,
    multiple,
  };
  const content = (
    <CascaderContext
      value={{
        ...path,
        valueMap: selection.valueMap,
        onClickOption: selection.foundation.click,
        loadOption: data.loadOption,
        isLoading: data.isLoading,
        expandTrigger,
        ellipsis,
        renderOption,
        separator,
        formatLabel,
      }}
    >
      {interaction.showSearchPanel ? (
        <CascaderSearchPanel
          options={filtered}
          activeKey={path.activeKey}
          multiple={multiple}
          checkStrictly={checkStrictly}
          loading={loading}
          spinProps={resolvedSpinProps}
          pathLabel={!searchOptionOnlyLabel}
          empty={empty}
        />
      ) : (
        <CascaderBasePanel
          displayColumns={path.displayColumns}
          selectedPath={path.selectedPath}
          activeKey={path.activeKey}
          multiple={multiple}
          checkStrictly={checkStrictly}
          totalLevel={data.totalLevel}
          loading={loading}
          spinProps={resolvedSpinProps}
          virtualListProps={virtual}
          empty={empty}
          dropdown
        />
      )}
    </CascaderContext>
  );
  return (
    <Trigger
      {...triggerProps}
      floatingOptions={floatingOptions ?? triggerProps?.floatingOptions}
      trigger="click"
      animationName="slide-dynamic-origin"
      autoFitTransformOrigin
      popupVisible={visible}
      position="bl"
      disabled={form.mergedDisabled}
      popupOffset={4}
      autoFitPopupWidth={interaction.showSearchPanel}
      popupContainer={popupContainer}
      preventFocus
      clickToClose={!mergedSearch}
      ariaHasPopup="menu"
      referenceElement={target}
      onPopupVisibleChange={requestVisible}
      content={content}
    >
      <span style={{ display: 'contents' }}>
        <Tooltip
          popupVisible={tip.visible}
          content={tip.text}
          position="top"
          referenceElement={target}
        >
          <span
            ref={host}
            style={{
              display: renderTrigger ? 'inline-flex' : 'contents',
              width: renderTrigger ? (fitWidth ? 'auto' : (style?.width ?? '100%')) : undefined,
              maxWidth: renderTrigger && maxWFull ? '100%' : undefined,
            }}
          >
            {renderTrigger ? (
              renderTrigger(triggerState)
            ) : (
              <SelectView
                {...viewProps}
                ref={view}
                value={selected}
                inputValue={interaction.inputValue}
                disabled={form.mergedDisabled}
                error={form.mergedError}
                size={form.mergedSize}
                multiple={multiple}
                allowClear={mergedClear}
                allowSearch={!!mergedSearch}
                opened={visible}
                loading={loading}
                fitWidth={fitWidth}
                maxWFull={maxWFull}
                className={[prefix, className].filter(Boolean).join(' ')}
                style={style}
                inputAttrs={{
                  'role': 'combobox',
                  'aria-expanded': visible,
                  'aria-haspopup': 'menu',
                  'aria-autocomplete': mergedSearch ? 'list' : 'none',
                  ...inputAttrs,
                }}
                onInputValueChange={(next) => interaction.inputChange(next, 'manual')}
                onRemove={(key) => selection.foundation.remove(String(key))}
                onClear={(event) => {
                  event.stopPropagation();
                  interaction.clear();
                }}
                onFocus={onFocus}
                onBlur={onBlur}
                onKeyDown={(event) => {
                  onKeyDown?.(event);
                  if (!event.defaultPrevented && !event.isComposing && !form.mergedDisabled)
                    keyboard(event.key, event);
                }}
              />
            )}
          </span>
        </Tooltip>
      </span>
    </Trigger>
  );
}
