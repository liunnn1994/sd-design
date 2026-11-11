import type {
  SelectOption,
  SelectModelValue,
  SelectOptionValue,
  SelectOptionData,
  SelectOptionInfo,
  SelectOptionGroupInfo,
  SelectFieldNames,
  FilterOption,
  SelectFallbackOption,
  SelectTriggerSlotProps,
} from '@sdata/web-core/select/types';
import type { ReactNode, Ref } from 'react';

import { getRelativeRect } from '@sdata/web-core/_utils/dom';
import {
  resolveAllowClear,
  resolveAllowSearch,
  resolveDropdownVirtualList,
} from '@sdata/web-core/config/prop-values';
import { createSelectFoundation } from '@sdata/web-core/select/foundation';
import { createSelectNavigation } from '@sdata/web-core/select/navigation';
import {
  DEFAULT_FIELD_NAMES,
  getOptionInfos,
  getValidOptions,
  isValidOption,
  isGroupOptionInfo,
  syncOptionInfoMap,
  getValueString,
} from '@sdata/web-core/select/options';
import { getValueObjects } from '@sdata/web-core/select/values';
import { resolveDropdownVirtualListProps } from '@sdata/web-core/select/virtual-dropdown';
import {
  createCompatTriggerFoundation,
  getDefaultPopupVisible,
} from '@sdata/web-core/trigger/compat-state';
import { useId, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';

import type { SelectViewProps, SelectViewValue } from '../_shared/select-view.js';
import type { VirtualListProps, VirtualListRef } from '../_shared/virtual-list.js';
import type { InputTagInstance } from '../input-tag/index.js';
import type { ScrollbarProps } from '../scrollbar/index.js';
import type { SpinProps } from '../spin/index.js';
import type { TriggerProps } from '../trigger/index.js';

import { SelectView } from '../_shared/select-view.js';
import { useAfterRender } from '../_shared/use-after-render.js';
import { useReadonlyTip } from '../_shared/use-readonly-tip.js';
import { VirtualList } from '../_shared/virtual-list.js';
import { Checkbox } from '../checkbox/index.js';
import { useConfig, usePrefix } from '../config-provider/index.js';
import { Ellipsis, PerformantEllipsis } from '../ellipsis/index.js';
import { useFormItem } from '../form/context.js';
import { Tooltip } from '../tooltip/index.js';
import { Trigger } from '../trigger/index.js';
import { SelectDropdown, type SelectDropdownRef } from './dropdown.js';

export type * from '@sdata/web-core/select/types';
export interface SelectInstance {
  focus(): void;
  blur(): void;
}
export interface SelectProps extends Omit<
  SelectViewProps,
  | 'value'
  | 'ref'
  | 'renderLabel'
  | 'renderTag'
  | 'onRemove'
  | 'allowSearch'
  | 'onClear'
  | 'onInputValueChange'
  | 'opened'
  | 'children'
> {
  value?: SelectModelValue;
  modelValue?: SelectModelValue;
  defaultValue?: SelectModelValue;
  defaultInputValue?: string;
  options?: SelectOption[];
  ellipsis?: boolean | 'performant-ellipsis';
  allowSearch?: boolean | { retainInputValue?: boolean };
  readonly?: boolean | string;
  popupVisible?: boolean;
  show?: boolean;
  defaultPopupVisible?: boolean;
  defaultShow?: boolean;
  defaultActiveFirstOption?: boolean;
  unmountOnClose?: boolean;
  popupContainer?: TriggerProps['popupContainer'];
  triggerProps?: Omit<TriggerProps, 'children' | 'content'>;
  floatingOptions?: TriggerProps['floatingOptions'];
  virtualListProps?: Omit<
    VirtualListProps<SelectOptionInfo | SelectOptionGroupInfo>,
    'items' | 'children'
  >;
  scrollbar?: boolean | ScrollbarProps;
  spinProps?: SpinProps;
  filterOption?: FilterOption;
  fallbackOption?: boolean | SelectFallbackOption;
  showExtraOptions?: boolean;
  valueKey?: string;
  fieldNames?: SelectFieldNames;
  searchDelay?: number;
  limit?: number;
  header?: ReactNode;
  footer?: ReactNode;
  empty?: ReactNode;
  showHeaderOnEmpty?: boolean;
  showFooterOnEmpty?: boolean;
  renderLabel?: (data: SelectOptionData) => ReactNode;
  renderTag?: (data: SelectOptionData) => ReactNode;
  renderOption?: (data: SelectOptionData) => ReactNode;
  renderTrigger?: (state: SelectTriggerSlotProps) => ReactNode;
  onValueChange?: (value: SelectModelValue) => void;
  onChange?: (value: SelectModelValue) => void;
  onInputValueChange?: (value: string) => void;
  onInputChange?: (value: string) => void;
  onPopupVisibleChange?: (visible: boolean) => void;
  onShowChange?: (visible: boolean) => void;
  onClear?: (event: Event) => void;
  onRemove?: (value: SelectOptionValue | undefined) => void;
  onSearch?: (value: string) => void;
  onDropdownScroll?: (event: Event) => void;
  onDropdownReachBottom?: (event: Event) => void;
  onExceedLimit?: (value: SelectOptionValue | undefined, event: Event) => void;
  ref?: Ref<SelectInstance>;
}

export function Select(props: SelectProps) {
  const {
    value,
    modelValue,
    defaultValue,
    defaultInputValue = '',
    options = [],
    ellipsis = true,
    multiple = false,
    allowSearch = true,
    allowClear = true,
    allowCreate = false,
    readonly,
    popupVisible,
    show,
    defaultPopupVisible,
    defaultShow,
    defaultActiveFirstOption: _defaultActiveFirstOption,
    unmountOnClose = false,
    popupContainer,
    triggerProps,
    floatingOptions,
    virtualListProps,
    scrollbar = true,
    spinProps,
    filterOption = true,
    fallbackOption: _fallbackOption,
    showExtraOptions = true,
    valueKey = 'value',
    fieldNames,
    searchDelay: _searchDelay,
    limit: _limit,
    header,
    footer,
    empty,
    showHeaderOnEmpty = false,
    showFooterOnEmpty = false,
    renderLabel,
    renderTag,
    renderOption,
    renderTrigger,
    onValueChange: _onValueChange,
    onChange: _onChange,
    onInputValueChange: _onInputValueChange,
    onInputChange: _onInputChange,
    onPopupVisibleChange: _onPopupVisibleChange,
    onShowChange: _onShowChange,
    onClear: _onClear,
    onRemove: _onRemove,
    onSearch: _onSearch,
    onDropdownScroll,
    onDropdownReachBottom,
    onExceedLimit: _onExceedLimit,
    ref,
    inputValue,
    loading = false,
    maxTagCount = 'responsive',
    fitWidth = false,
    maxWFull = true,
    className,
    style,
    inputAttrs,
    onKeyDown,
    ...viewProps
  } = props;
  const config = useConfig();
  const prefix = usePrefix('select');
  const optionPrefix = usePrefix('select-option');
  const groupPrefix = usePrefix('select-group');
  const uid = useId();
  const form = useFormItem(props);
  const tip = useReadonlyTip(readonly, form.mergedDisabled);
  const afterRender = useAfterRender();
  const [, redraw] = useState(0);
  const view = useRef<InputTagInstance>(null);
  const host = useRef<HTMLSpanElement>(null);
  const [target, setTarget] = useState<HTMLElement | null>(null);
  useLayoutEffect(() => {
    const next = renderTrigger ? host.current : host.current?.firstElementChild;
    const element = next instanceof HTMLElement ? next : null;
    if (element !== target) setTarget(element);
  });
  const dropdown = useRef<SelectDropdownRef>(null);
  const virtual = useRef<VirtualListRef>(null);
  const optionElements = useRef(new Map<string, HTMLElement>());
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const local = useRef({
    value: defaultValue === undefined ? ((multiple ? [] : '') as SelectModelValue) : defaultValue,
    input: defaultInputValue,
    visible: getDefaultPopupVisible({ defaultPopupVisible, defaultShow }),
    active: undefined as string | undefined,
    selected: {} as Record<string, unknown>,
  });
  const mergedSearch = resolveAllowSearch({
    hasLocalProp: Object.hasOwn(props, 'allowSearch'),
    hasCompatProp: false,
    localValue: allowSearch,
    compatValue: undefined,
    globalValue: config.allowSearch,
    defaultValue: undefined,
  });
  const mergedClear = resolveAllowClear({
    hasLocalProp: Object.hasOwn(props, 'allowClear'),
    localValue: allowClear,
    globalValue: config.allowClear,
  });
  const mergedVirtual = resolveDropdownVirtualList<SelectProps['virtualListProps']>({
    hasLocalProp: Object.hasOwn(props, 'virtualListProps'),
    localValue: virtualListProps,
    globalValue: config.virtualListProps,
  });
  const virtualProps = resolveDropdownVirtualListProps(mergedVirtual, triggerProps, 36);
  const controlled = modelValue !== undefined ? modelValue : value;
  const currentValue = controlled !== undefined ? controlled : local.current.value;
  const currentInput = inputValue ?? local.current.input;
  const visible = popupVisible ?? show ?? local.current.visible;
  const values = getValueObjects(currentValue, valueKey);
  const valueKeys = values.map((item) => item.key);
  const fields = { ...DEFAULT_FIELD_NAMES, ...fieldNames };
  const live = useRef({
    props,
    form,
    tip,
    visible,
    values,
    valueKeys,
    currentInput,
    mergedSearch,
    fields,
    map: new Map<string, SelectOptionInfo>(),
    enabled: [] as string[],
  });
  live.current = {
    props,
    form,
    tip,
    visible,
    values,
    valueKeys,
    currentInput,
    mergedSearch,
    fields,
    map: live.current.map,
    enabled: live.current.enabled,
  };
  const refresh = () => redraw((version) => version + 1);
  const [popup] = useState(() =>
    createCompatTriggerFoundation(
      {
        get defaultPopupVisible() {
          return live.current.props.defaultPopupVisible;
        },
        get defaultShow() {
          return live.current.props.defaultShow;
        },
        get popupVisible() {
          return live.current.props.popupVisible;
        },
        get show() {
          return live.current.props.show;
        },
        get visible() {
          return live.current.visible;
        },
        get localVisible() {
          return local.current.visible;
        },
        set localVisible(next) {
          local.current.visible = next;
          refresh();
        },
      },
      (event, next) => {
        if (event === 'update:popupVisible') live.current.props.onPopupVisibleChange?.(next);
        if (event === 'update:show') live.current.props.onShowChange?.(next);
      },
    ),
  );
  const requestVisible = (next: boolean) => {
    if (live.current.form.mergedDisabled) return;
    if (next && live.current.props.readonly) {
      live.current.tip.show();
      return;
    }
    popup.handlePopupVisibleChange(next);
  };
  const [foundation] = useState(() =>
    createSelectFoundation<Event>({
      getOptions: () => live.current.map,
      getMultiple: () => !!live.current.props.multiple,
      getReadonly: () => !!live.current.props.readonly || live.current.form.mergedDisabled,
      getLimit: () => live.current.props.limit ?? 0,
      getValueKey: () => live.current.props.valueKey ?? 'value',
      getFieldNames: () => live.current.fields,
      getAllowCreate: () => !!live.current.props.allowCreate,
      getFallbackOption: () => live.current.props.fallbackOption ?? true,
      getInputValue: () => live.current.currentInput,
      getValueObjects: () => live.current.values,
      getValueKeys: () => live.current.valueKeys,
      getEnabledKeys: () => live.current.enabled,
      getPopupVisible: () => live.current.visible,
      getRetainInput: () =>
        typeof live.current.mergedSearch === 'object' &&
        !!live.current.mergedSearch.retainInputValue,
      getAllowSearch: () => !!live.current.mergedSearch,
      getSelectedOptions: () => local.current.selected,
      setSelectedOptions: (next) => {
        local.current.selected = next;
      },
      setValue: (next) => {
        local.current.value = next;
        refresh();
      },
      setInputValue: (next) => {
        local.current.input = next;
        refresh();
      },
      setPopupVisible: requestVisible,
      search: (next) => {
        clearTimeout(timer.current);
        timer.current = setTimeout(
          () => live.current.props.onSearch?.(next),
          live.current.props.searchDelay ?? 500,
        );
      },
      onFormChange: () => live.current.form.eventHandlers?.onChange?.(),
      events: {
        updateValue: (next) => live.current.props.onValueChange?.(next),
        change: (next) => live.current.props.onChange?.(next),
        updateInput: (next) => live.current.props.onInputValueChange?.(next),
        inputChange: (next) => live.current.props.onInputChange?.(next),
        exceedLimit: (next, event) => live.current.props.onExceedLimit?.(next, event),
        remove: (next) => live.current.props.onRemove?.(next),
        clear: (event) => live.current.props.onClear?.(event),
      },
    }),
  );
  const map = new Map<string, SelectOptionInfo>();
  const base = getOptionInfos(options, {
    valueKey,
    fieldNames: fields,
    origin: 'options',
    optionInfoMap: map,
  });
  live.current.map = map;
  const extraMap = new Map<string, SelectOptionInfo>();
  const extra = getOptionInfos(foundation.getExtraOptions(foundation.getExtraValueData()), {
    valueKey,
    fieldNames: fields,
    origin: 'extraOptions',
    optionInfoMap: extraMap,
  });
  const mergedMap = new Map<string, SelectOptionInfo>();
  syncOptionInfoMap(mergedMap, map, extraMap);
  live.current.map = mergedMap;
  const filter = { inputValue: currentInput, filterOption };
  const valid = [
    ...getValidOptions(base, filter),
    ...(showExtraOptions ? getValidOptions(extra, filter) : []),
  ];
  const validInfos = [...mergedMap.values()].filter(
    (option) =>
      (showExtraOptions || option.origin !== 'extraOptions') && isValidOption(option, filter),
  );
  const enabled = validInfos.filter((option) => !option.disabled).map((option) => option.key);
  live.current.enabled = enabled;
  const [navigation] = useState(() =>
    createSelectNavigation<KeyboardEvent | MouseEvent>({
      getEnabledKeys: () => live.current.enabled,
      getActiveKey: () => local.current.active,
      getValueKeys: () => live.current.valueKeys,
      getDefaultActiveFirst: () => live.current.props.defaultActiveFirstOption ?? true,
      getLoading: () => live.current.props.loading,
      getPopupVisible: () => live.current.visible,
      getEnterToOpen: () => true,
      setActiveKey: (next) => {
        if (local.current.active !== next) {
          local.current.active = next;
          refresh();
        }
      },
      scrollIntoView: (key) => {
        virtual.current?.scrollTo({ key });
        const wrapper = dropdown.current?.wrapperRef;
        const element = optionElements.current.get(key);
        if (!wrapper || !element || wrapper.scrollHeight === wrapper.offsetHeight) return;
        const rect = getRelativeRect(element, wrapper);
        if (rect.top < 0) wrapper.scrollTo(0, wrapper.scrollTop + rect.top);
        else if (rect.bottom < 0) wrapper.scrollTo(0, wrapper.scrollTop - rect.bottom);
      },
      select: foundation.handleSelect,
      setPopupVisible: requestVisible,
      afterRender: (task) => {
        void afterRender().then(task);
      },
    }),
  );
  const previousControlled = useRef(controlled);
  useLayoutEffect(() => {
    if (
      previousControlled.current !== controlled &&
      (controlled === undefined || controlled === null)
    ) {
      local.current.value = multiple ? [] : controlled;
      refresh();
    }
    previousControlled.current = controlled;
  }, [controlled, multiple]);
  const keySignature = JSON.stringify(enabled);
  const previousKeys = useRef(keySignature);
  useLayoutEffect(() => {
    if (previousKeys.current !== keySignature) navigation.enabledKeysChanged(enabled);
    previousKeys.current = keySignature;
  }, [navigation, keySignature]);
  const previousVisible = useRef(visible);
  useLayoutEffect(() => {
    popup.syncLocal(visible);
    if (previousVisible.current !== visible) foundation.popupChanged(visible);
    previousVisible.current = visible;
    if (visible) navigation.opened();
  }, [visible, foundation, navigation, popup]);
  useLayoutEffect(() => () => clearTimeout(timer.current), []);
  useImperativeHandle(
    ref,
    () => ({ focus: () => view.current?.focus(), blur: () => view.current?.blur() }),
    [],
  );
  const selected: SelectViewValue[] = values.flatMap((item) => {
    const option = mergedMap.get(item.key);
    return option
      ? [
          {
            ...option,
            value: item.key,
            label: option.label ?? getValueString(item.value, valueKey),
            closable: !option.disabled,
            option: option.raw,
          },
        ]
      : [];
  });
  const optionId = (key: string) => `${optionPrefix}-${uid}-${key}`;
  const label = (text: string) =>
    ellipsis === false ? (
      text
    ) : ellipsis === 'performant-ellipsis' ? (
      <PerformantEllipsis>{text}</PerformantEllipsis>
    ) : (
      <Ellipsis>{text}</Ellipsis>
    );
  const render = (option: SelectOptionInfo | SelectOptionGroupInfo): ReactNode => {
    if (isGroupOptionInfo(option)) {
      const Group = virtualProps ? 'div' : 'li';
      const List = virtualProps ? 'div' : 'ul';
      return (
        <Group key={option.key} role="group" aria-label={option.label} className={groupPrefix}>
          <div className={`${groupPrefix}-title`}>{label(option.label)}</div>
          <List role="presentation" className={`${prefix}-dropdown-list`}>
            {option.options.map(render)}
          </List>
        </Group>
      );
    }
    const Tag = virtualProps ? 'div' : 'li';
    const isSelected = valueKeys.includes(option.key);
    const content = renderOption ? renderOption(option.raw) : label(option.label);
    return (
      <Tag
        key={option.key}
        id={optionId(option.key)}
        ref={(node: HTMLElement | null) => {
          if (node) optionElements.current.set(option.key, node);
          else optionElements.current.delete(option.key);
        }}
        role="option"
        aria-selected={isSelected}
        aria-disabled={option.disabled || undefined}
        className={[
          optionPrefix,
          option.disabled && `${optionPrefix}-disabled`,
          isSelected && `${optionPrefix}-selected`,
          local.current.active === option.key && `${optionPrefix}-active`,
          multiple && `${optionPrefix}-multiple`,
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={(event) => {
          if (!option.disabled) foundation.handleSelect(option.key, event.nativeEvent);
        }}
        onMouseEnter={() => {
          if (!option.disabled) {
            local.current.active = option.key;
            refresh();
          }
        }}
        onMouseLeave={() => {
          if (!option.disabled) {
            local.current.active = undefined;
            refresh();
          }
        }}
      >
        {multiple ? (
          <Checkbox
            className={`${optionPrefix}-checkbox`}
            modelValue={isSelected}
            disabled={option.disabled}
            uninjectGroupContext
          >
            {content}
          </Checkbox>
        ) : (
          <span className={`${optionPrefix}-content`}>{content}</span>
        )}
      </Tag>
    );
  };
  const popupContent = (
    <SelectDropdown
      ref={dropdown}
      loading={loading}
      spinProps={{ ...config.selectSpinProps, ...spinProps }}
      empty={validInfos.length === 0}
      scrollbar={scrollbar}
      header={header}
      footer={footer}
      emptyContent={empty}
      showHeaderOnEmpty={showHeaderOnEmpty}
      showFooterOnEmpty={showFooterOnEmpty}
      onScroll={onDropdownScroll}
      onReachBottom={onDropdownReachBottom}
      virtualList={
        virtualProps && (
          <VirtualList {...virtualProps} ref={virtual} items={valid}>
            {({ item }) => render(item)}
          </VirtualList>
        )
      }
    >
      {valid.map(render)}
    </SelectDropdown>
  );
  const triggerState: SelectTriggerSlotProps = {
    value: multiple ? values.map((item) => item.value) : values[0]?.value,
    displayValue: multiple ? selected.map((item) => item.label) : (selected[0]?.label ?? ''),
    inputValue: currentInput,
    selectedOptions: selected.map((item) => item.option as SelectOptionData),
    popupVisible: visible,
    disabled: form.mergedDisabled,
    loading,
    multiple,
  };
  return (
    <Trigger
      trigger="click"
      position="bl"
      popupOffset={4}
      animationName="slide-dynamic-origin"
      hideEmpty
      preventFocus
      autoFitPopupWidth
      autoFitTransformOrigin
      ariaHasPopup="listbox"
      disabled={form.mergedDisabled}
      popupVisible={visible}
      unmountOnClose={unmountOnClose}
      clickToClose={!(mergedSearch || allowCreate)}
      popupContainer={popupContainer}
      onPopupVisibleChange={requestVisible}
      referenceElement={target}
      {...triggerProps}
      floatingOptions={floatingOptions ?? triggerProps?.floatingOptions}
      content={popupContent}
    >
      <span className={`${prefix}-trigger`} style={{ display: 'contents' }}>
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
                inputValue={currentInput}
                multiple={multiple}
                disabled={form.mergedDisabled}
                error={form.mergedError}
                size={form.mergedSize}
                loading={loading}
                allowClear={mergedClear}
                allowCreate={allowCreate}
                allowSearch={!!mergedSearch}
                opened={visible}
                maxTagCount={maxTagCount}
                fitWidth={fitWidth}
                maxWFull={maxWFull}
                className={[prefix, className].filter(Boolean).join(' ')}
                style={style}
                inputAttrs={{
                  'role': 'combobox',
                  'aria-expanded': visible,
                  'aria-autocomplete': mergedSearch ? 'list' : 'none',
                  'aria-activedescendant': local.current.active
                    ? optionId(local.current.active)
                    : undefined,
                  ...inputAttrs,
                }}
                onInputValueChange={foundation.handleInputValueChange}
                onKeyDown={(event) => {
                  onKeyDown?.(event);
                  navigation.keydown(event.key, event, event.isComposing);
                }}
                onRemove={(key) => foundation.handleRemove(String(key))}
                onClear={(event) => {
                  event.stopPropagation();
                  foundation.handleClear(event);
                }}
                renderLabel={(data) =>
                  renderLabel ? renderLabel(data.option as SelectOptionData) : data.label
                }
                renderTag={(data) =>
                  renderTag
                    ? renderTag(data.option as SelectOptionData)
                    : renderLabel
                      ? renderLabel(data.option as SelectOptionData)
                      : data.label
                }
              />
            )}
          </span>
        </Tooltip>
      </span>
    </Trigger>
  );
}
export default Select;
