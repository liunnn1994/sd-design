import type { TreeSelectValue } from '@sdata/web-core/tree-select/types';
import type { Ref, ReactNode, CSSProperties } from 'react';

import { definedProps } from '@sdata/web-core/_utils/defined-props';
import {
  resolveAllowClear,
  resolveAllowSearch,
  resolveDropdownVirtualList,
} from '@sdata/web-core/config/prop-values';
import { resolveDropdownVirtualListProps } from '@sdata/web-core/select/virtual-dropdown';
import {
  getTreeSelectTriggerValue,
  getTreeSelectDisplayValue,
  getTreeSelectSelectedOptions,
} from '@sdata/web-core/tree-select/presentation';
import { isTreeSelectSelectable } from '@sdata/web-core/tree-select/presentation';
import { getTreeSelectViewValues } from '@sdata/web-core/tree-select/presentation';
import { useImperativeHandle, useRef, useState, useLayoutEffect } from 'react';

import type { SelectViewProps } from '../_shared/select-view.js';
import type { InputTagInstance } from '../input-tag/index.js';
import type { ScrollbarProps } from '../scrollbar/index.js';
import type { TreeNodeData } from '../tree/node.js';
import type { TreeProps } from '../tree/tree.js';
import type { TriggerProps } from '../trigger/types.js';
import type { TreeSelectInteractionProps } from './use-interaction.js';
import type { TreeSelectSelectionProps } from './use-selection.js';

import { SelectView } from '../_shared/select-view.js';
import { useReadonlyTip } from '../_shared/use-readonly-tip.js';
import { useConfig, usePrefix } from '../config-provider/index.js';
import { Empty } from '../empty/index.js';
import { useFormItem } from '../form/context.js';
import { Spin, type SpinProps } from '../spin/index.js';
import { Tooltip } from '../tooltip/index.js';
import { useTreeData } from '../tree/use-tree-data.js';
import { Trigger } from '../trigger/index.js';
import { TreeSelectPanel } from './panel.js';
import { useTreeSelectFilter } from './use-filter.js';
import { useTreeSelectInteraction } from './use-interaction.js';
import { useTreeSelectSelection } from './use-selection.js';

export interface TreeSelectInstance {
  focus(): void;
  blur(): void;
}
export interface TreeSelectTriggerState<T> {
  value: TreeSelectValue | undefined;
  displayValue: string | string[];
  inputValue: string;
  selectedOptions: T[];
  popupVisible: boolean;
  disabled: boolean;
  loading: boolean;
  multiple: boolean;
}
export interface TreeSelectProps<T extends TreeNodeData = TreeNodeData>
  extends
    Omit<
      SelectViewProps,
      | keyof TreeSelectSelectionProps<T>
      | keyof TreeSelectInteractionProps
      | 'ref'
      | 'onClear'
      | 'onRemove'
      | 'defaultValue'
      | 'children'
    >,
    Omit<TreeSelectSelectionProps<T>, keyof TreeSelectInteractionProps | 'readonly'>,
    TreeSelectInteractionProps {
  ref?: Ref<TreeSelectInstance>;
  data?: T[];
  options?: T[];
  checkable?: boolean;
  filterable?: boolean;
  clearable?: boolean;
  border?: boolean;
  ellipsis?: TreeProps<T>['ellipsis'];
  treeCheckedStrategy?: TreeProps<T>['checkedStrategy'];
  checkStrategy?: TreeProps<T>['checkedStrategy'];
  selectable?: boolean | 'leaf' | Exclude<TreeProps<T>['selectable'], boolean>;
  virtualListProps?: TreeProps<T>['virtualListProps'];
  virtualScroll?: boolean;
  triggerProps?: Omit<TriggerProps, 'children' | 'content'>;
  popupContainer?: TriggerProps['popupContainer'];
  floatingOptions?: TriggerProps['floatingOptions'];
  treeProps?: TreeProps<T>;
  loadMore?: TreeProps<T>['loadMore'];
  filterTreeNode?(keyword: string, node: T): boolean;
  disableFilter?: boolean;
  renderTrigger?(state: TreeSelectTriggerState<T>): ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  empty?: ReactNode;
  loader?: ReactNode;
  showHeaderOnEmpty?: boolean;
  showFooterOnEmpty?: boolean;
  spinProps?: SpinProps;
  scrollbar?: boolean | ScrollbarProps;
  dropdownClassName?: string;
  dropdownStyle?: CSSProperties;
}
export function TreeSelect<T extends TreeNodeData = TreeNodeData>(props: TreeSelectProps<T>) {
  const {
    ref,
    renderTrigger,
    header,
    footer,
    empty,
    loader,
    showHeaderOnEmpty = false,
    showFooterOnEmpty = false,
    spinProps,
    scrollbar,
    dropdownClassName,
    dropdownStyle,
    loading = false,
    data = props.options,
    options: _options,
    checkable: _checkable,
    filterable: _filterable,
    clearable: _clearable,
    border,
    ellipsis,
    treeCheckedStrategy = props.checkStrategy,
    checkStrategy: _checkStrategy,
    selectable = true,
    virtualListProps,
    virtualScroll = true,
    triggerProps,
    popupContainer,
    floatingOptions,
    treeProps,
    loadMore,
    value,
    defaultValue,
    multiple,
    treeCheckable = props.checkable ?? false,
    treeCheckStrictly,
    labelInValue,
    readonly,
    disabled: _disabled,
    showPath,
    separator,
    fieldNames,
    fallbackOption,
    inputValue,
    defaultInputValue,
    popupVisible,
    defaultPopupVisible,
    show,
    defaultShow,
    allowSearch,
    retainInputValue,
    onValueChange,
    onChange,
    onClear,
    onInputValueChange,
    onSearch,
    onPopupVisibleChange,
    onShowChange,
    filterTreeNode,
    disableFilter,
    ...viewProps
  } = props;
  const mergedEllipsis = ellipsis ?? treeProps?.ellipsis ?? true;
  const prefix = usePrefix('tree-select');
  const config = useConfig();
  const form = useFormItem(props);
  const view = useRef<InputTagInstance>(null);
  const host = useRef<HTMLSpanElement>(null);
  const [target, setTarget] = useState<HTMLElement | null>(null);
  useLayoutEffect(() => {
    const element = host.current?.firstElementChild;
    const next = element instanceof HTMLElement ? element : null;
    if (next !== target) setTarget(next);
  });
  const tip = useReadonlyTip(readonly, form.mergedDisabled);
  const isMultiple = !!(multiple || treeCheckable);
  const search = resolveAllowSearch({
    hasLocalProp: Object.hasOwn(props, 'allowSearch'),
    hasCompatProp: Object.hasOwn(props, 'filterable'),
    localValue: allowSearch,
    compatValue: props.filterable,
    globalValue: config.allowSearch,
    defaultValue: isMultiple,
  });
  const clear = resolveAllowClear({
    hasLocalProp: Object.hasOwn(props, 'allowClear') || Object.hasOwn(props, 'clearable'),
    localValue: props.allowClear ?? props.clearable,
    globalValue: config.allowClear,
  });
  const isSelectable: NonNullable<TreeProps<T>['selectable']> = (node, info) =>
    isTreeSelectSelectable({ value: selectable }, node, info);
  const virtual = virtualScroll
    ? resolveDropdownVirtualListProps(
        resolveDropdownVirtualList({
          hasLocalProp: Object.hasOwn(props, 'virtualListProps'),
          localValue: virtualListProps ?? treeProps?.virtualListProps,
          globalValue: config.virtualListProps,
        }),
        triggerProps,
        32,
      )
    : undefined;
  const interaction = useTreeSelectInteraction(
    {
      inputValue,
      defaultInputValue,
      popupVisible,
      defaultPopupVisible,
      show,
      defaultShow,
      readonly,
      disabled: form.mergedDisabled,
      allowSearch: search,
      onInputValueChange,
      onSearch,
      onPopupVisibleChange,
      onShowChange,
    },
    { showReadonlyTip: tip.show, blur: () => selection.foundation.blur() },
  );
  const model = useTreeData({
    treeData: data,
    fieldNames,
    selectable: isSelectable,
    checkable: treeCheckable ? isSelectable : false,
    loadMore: !!loadMore,
  });
  const selection = useTreeSelectSelection(
    {
      value,
      defaultValue,
      multiple,
      treeCheckable,
      treeCheckStrictly,
      labelInValue,
      readonly: !!readonly,
      disabled: form.mergedDisabled,
      showPath,
      separator,
      fieldNames,
      fallbackOption,
      inputValue: interaction.inputValue,
      retainInputValue: retainInputValue ?? (typeof search === 'object' && search.retainInputValue),
      onValueChange,
      onChange,
      onClear,
    },
    {
      nodes: model.key2TreeNode,
      setVisible: interaction.foundation.setPanelVisible,
      setInputValue: interaction.foundation.updateInputValue,
      onFormChange: () => form.eventHandlers?.onChange?.(),
    },
  );
  const filter = useTreeSelectFilter({
    searchValue: interaction.inputValue,
    nodes: model.flattenTreeData,
    fieldNames,
    filterMethod: filterTreeNode,
    disableFilter,
  });
  const values = getTreeSelectViewValues({
    selectedValues: selection.selectedValues,
    multiple: isMultiple,
    disabled: form.mergedDisabled,
    nodes: model.key2TreeNode,
    isNodeClosable: selection.foundation.isNodeClosable,
  }).map((item) => ({
    ...item,
    label: String(item.label),
    closable: item.closable ?? !form.mergedDisabled,
  }));
  useImperativeHandle(ref, () => ({
    focus: () => (renderTrigger ? target?.focus() : view.current?.focus()),
    blur: () => (renderTrigger ? target?.blur() : view.current?.blur()),
  }));
  const isEmpty = !data?.length || !!filter.isEmptyFilterResult;
  return (
    <Trigger
      {...triggerProps}
      popupContainer={popupContainer}
      floatingOptions={floatingOptions ?? triggerProps?.floatingOptions}
      popupOffset={4}
      clickToClose={!search}
      referenceElement={target}
      popupVisible={interaction.visible}
      onPopupVisibleChange={(next) => {
        if (!form.mergedDisabled) interaction.foundation.setPanelVisible(next);
      }}
      disabled={form.mergedDisabled}
      trigger="click"
      position="bl"
      autoFitPopupWidth={mergedEllipsis !== false}
      preventFocus
      content={
        <div
          className={[
            `${prefix}-popup`,
            header != null && `${prefix}-has-header`,
            footer != null && `${prefix}-has-footer`,
            dropdownClassName,
          ]
            .filter(Boolean)
            .join(' ')}
          style={{ ...dropdownStyle, ...(virtual ? { maxHeight: 'unset' } : {}) }}
        >
          {header != null && (!isEmpty || showHeaderOnEmpty) && (
            <div className={`${prefix}-header`}>{header}</div>
          )}
          {loading
            ? (loader ?? <Spin {...config.treeSelectSpinProps} {...spinProps} />)
            : isEmpty
              ? (empty ?? config.renderEmpty?.({ component: 'tree-select' }) ?? <Empty />)
              : null}
          {!loading && !!data?.length && (
            <TreeSelectPanel
              selectedKeys={selection.selectedKeys}
              showCheckable={!!treeCheckable}
              onChange={selection.foundation.select}
              scrollbar={
                isEmpty
                  ? {
                      ...(typeof scrollbar === 'object' ? scrollbar : {}),
                      outerStyle: { display: 'none' },
                    }
                  : scrollbar
              }
              ellipsis={mergedEllipsis}
              treeProps={definedProps({
                ...treeProps,
                data,
                virtualListProps: virtual,
                selectable: isSelectable,
                actionOnNodeClick: selectable === 'leaf' ? 'expand' : treeProps?.actionOnNodeClick,
                checkedStrategy: treeCheckedStrategy,
                fieldNames,
                loadMore,
                defaultExpandAll: treeProps?.defaultExpandAll ?? false,
                checkable: treeCheckable ? isSelectable : false,
                checkStrictly: treeCheckStrictly,
                multiple: isMultiple,
                filterTreeNode: filter.filterTreeNode,
                searchValue: interaction.inputValue,
              })}
            />
          )}
          {footer != null && (!isEmpty || showFooterOnEmpty) && (
            <div className={`${prefix}-footer`}>{footer}</div>
          )}
        </div>
      }
    >
      <span style={{ display: 'contents' }}>
        <Tooltip popupVisible={tip.visible} content={tip.text} referenceElement={target}>
          <span ref={host} style={{ display: 'contents' }}>
            {renderTrigger ? (
              renderTrigger({
                value: getTreeSelectTriggerValue({
                  labelInValue: !!labelInValue,
                  selectedValues: selection.selectedValues,
                  selectedKeys: selection.selectedKeys,
                  multiple: isMultiple,
                }),
                displayValue: getTreeSelectDisplayValue({ values, multiple: isMultiple }),
                inputValue: interaction.inputValue,
                selectedOptions: getTreeSelectSelectedOptions(values),
                popupVisible: interaction.visible,
                disabled: form.mergedDisabled,
                loading,
                multiple: isMultiple,
              })
            ) : (
              <SelectView
                {...viewProps}
                ref={view}
                className={[prefix, viewProps.className].filter(Boolean).join(' ')}
                value={values}
                loading={loading}
                allowClear={clear}
                bordered={border ?? viewProps.bordered}
                multiple={isMultiple}
                allowSearch={!!search}
                inputValue={interaction.inputValue}
                opened={interaction.visible}
                disabled={form.mergedDisabled}
                size={form.mergedSize}
                error={form.mergedError}
                inputAttrs={{
                  'role': 'combobox',
                  'aria-expanded': interaction.visible,
                  'aria-haspopup': 'tree',
                  'aria-autocomplete': search ? 'list' : 'none',
                  ...viewProps.inputAttrs,
                }}
                onInputValueChange={interaction.foundation.handleInputValueChange}
                onBlur={(event) => {
                  viewProps.onBlur?.(event);
                  selection.foundation.blur();
                }}
                onRemove={selection.foundation.remove}
                onClear={(event) => {
                  event.stopPropagation();
                  selection.foundation.clear();
                }}
              />
            )}
          </span>
        </Tooltip>
      </span>
    </Trigger>
  );
}
