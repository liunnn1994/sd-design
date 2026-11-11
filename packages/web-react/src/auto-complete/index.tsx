import type {
  AutoCompleteData,
  AutoCompleteFilterOption,
} from '@sdata/web-core/auto-complete/types';
import type { SelectOptionInfo, SelectOptionGroupInfo } from '@sdata/web-core/select/types';
import type { ReactNode, Ref } from 'react';

import { getRelativeRect } from '@sdata/web-core/_utils/dom';
import {
  createAutoComplete,
  getAutoCompleteFilter,
} from '@sdata/web-core/auto-complete/foundation';
import { resolveAllowClear, resolveDropdownVirtualList } from '@sdata/web-core/config/prop-values';
import { createSelectNavigation } from '@sdata/web-core/select/navigation';
import {
  DEFAULT_FIELD_NAMES,
  getOptionInfos,
  getValidOptions,
  isValidOption,
  isGroupOptionInfo,
  getKeyFromValue,
} from '@sdata/web-core/select/options';
import { resolveDropdownVirtualListProps } from '@sdata/web-core/select/virtual-dropdown';
import { useId, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';

import { useAfterRender } from '../_shared/use-after-render.js';
import {
  VirtualList,
  type VirtualListProps,
  type VirtualListRef,
} from '../_shared/virtual-list.js';
import { useConfig, usePrefix } from '../config-provider/index.js';
import { Ellipsis } from '../ellipsis/index.js';
import { useFormItem } from '../form/context.js';
import { Input, type InputInstance, type InputProps } from '../input/index.js';
import { SelectDropdown, type SelectDropdownRef } from '../select/dropdown.js';
import { Trigger, type TriggerProps } from '../trigger/index.js';
export type * from '@sdata/web-core/auto-complete/types';
export interface AutoCompleteInstance {
  readonly inputRef: InputInstance | null;
  focus(): void;
  blur(): void;
}
export interface AutoCompleteProps extends Omit<
  InputProps,
  'value' | 'defaultValue' | 'ref' | 'onChange' | 'onSelect' | 'onClear'
> {
  value?: string | null;
  modelValue?: string | null;
  defaultValue?: string;
  data?: AutoCompleteData;
  strict?: boolean;
  filterOption?: AutoCompleteFilterOption;
  popupContainer?: TriggerProps['popupContainer'];
  triggerProps?: Omit<TriggerProps, 'children' | 'content'>;
  floatingOptions?: TriggerProps['floatingOptions'];
  virtualListProps?: Omit<
    VirtualListProps<SelectOptionInfo | SelectOptionGroupInfo>,
    'items' | 'children'
  >;
  renderOption?: (data: SelectOptionInfo) => ReactNode;
  footer?: ReactNode;
  onChange?: (value: string) => void;
  onSelect?: (value: string) => void;
  onSearch?: (value: string) => void;
  onClear?: (event: Event) => void;
  onDropdownScroll?: (event: Event) => void;
  onDropdownReachBottom?: (event: Event) => void;
  ref?: Ref<AutoCompleteInstance>;
}
export function AutoComplete(props: AutoCompleteProps) {
  const {
    value: _value,
    modelValue,
    defaultValue = '',
    data = [],
    strict = false,
    filterOption = true,
    popupContainer,
    triggerProps,
    floatingOptions,
    virtualListProps,
    renderOption,
    footer,
    onValueChange: _onValueChange,
    onChange: _onChange,
    onSelect: _onSelect,
    onSearch: _onSearch,
    onClear: _onClear,
    onDropdownScroll,
    onDropdownReachBottom,
    onInput,
    onKeyDown,
    ref,
    inputAttrs,
    allowClear = false,
    disabled: _disabled,
    readonly = false,
    ...inputProps
  } = props;
  const config = useConfig();
  const form = useFormItem(props);
  const prefix = usePrefix('auto-complete');
  const optionPrefix = usePrefix('select-option');
  const groupPrefix = usePrefix('select-group');
  const listPrefix = usePrefix('select-dropdown-list');
  const uid = useId();
  const input = useRef<InputInstance>(null);
  const dropdown = useRef<SelectDropdownRef>(null);
  const virtual = useRef<VirtualListRef>(null);
  const host = useRef<HTMLSpanElement>(null);
  const elements = useRef(new Map<string, HTMLElement>());
  const [target, setTarget] = useState<HTMLElement | null>(null);
  useLayoutEffect(() => {
    const next = host.current?.firstElementChild;
    const node = next instanceof HTMLElement ? next : null;
    if (node !== target) setTarget(node);
  });
  const [, render] = useState(0);
  const refresh = () => render((version) => version + 1);
  const local = useRef({
    value: defaultValue,
    popup: false,
    active: undefined as string | undefined,
  });
  const controlled = modelValue !== undefined ? modelValue : props.value;
  const current = controlled ?? local.current.value;
  const afterRender = useAfterRender();
  const map = new Map<string, SelectOptionInfo>();
  const base = getOptionInfos(data, {
    valueKey: 'value',
    fieldNames: DEFAULT_FIELD_NAMES,
    origin: 'options',
    optionInfoMap: map,
  });
  const filter = { inputValue: current, filterOption: getAutoCompleteFilter(filterOption, strict) };
  const valid = getValidOptions(base, filter);
  const validInfos = [...map.values()].filter((option) => isValidOption(option, filter));
  const enabled = validInfos.filter((option) => !option.disabled).map((option) => option.key);
  const visible = local.current.popup && validInfos.length > 0;
  const virtualProps = resolveDropdownVirtualListProps(
    resolveDropdownVirtualList({
      hasLocalProp: Object.hasOwn(props, 'virtualListProps'),
      localValue: virtualListProps,
      globalValue: config.virtualListProps,
    }),
    triggerProps,
    36,
  ) as AutoCompleteProps['virtualListProps'];
  const mergedClear = resolveAllowClear({
    hasLocalProp: Object.hasOwn(props, 'allowClear'),
    localValue: allowClear,
    globalValue: config.allowClear,
  });
  const live = useRef({ props, form, map, current, enabled, visible });
  live.current = { props, form, map, current, enabled, visible };
  const [foundation] = useState(() =>
    createAutoComplete({
      get readonly() {
        return live.current.props.readonly ?? false;
      },
      get disabled() {
        return live.current.form.mergedDisabled;
      },
      get options() {
        return live.current.map;
      },
      setInner(next) {
        local.current.value = next;
        refresh();
      },
      setPopup(next) {
        if (next !== local.current.popup) {
          local.current.popup = next;
          refresh();
        }
      },
      onUpdate: (next) => live.current.props.onValueChange?.(next),
      onChange: (next) => live.current.props.onChange?.(next),
      onFormChange: () => live.current.form.eventHandlers?.onChange?.(),
      onSelect: (next) => live.current.props.onSelect?.(next),
      onSearch: (next) => live.current.props.onSearch?.(next),
      onClear: (event) => live.current.props.onClear?.(event),
      blur: () => input.current?.blur(),
    }),
  );
  const setActive = (next?: string) => {
    if (next !== local.current.active) {
      local.current.active = next;
      refresh();
    }
  };
  const [navigation] = useState(() =>
    createSelectNavigation<KeyboardEvent | MouseEvent>({
      getEnabledKeys: () => live.current.enabled,
      getActiveKey: () => local.current.active,
      getValueKeys: () => (live.current.current ? [getKeyFromValue(live.current.current)] : []),
      getDefaultActiveFirst: () => true,
      getLoading: () => false,
      getPopupVisible: () => live.current.visible,
      getEnterToOpen: () => true,
      setActiveKey: setActive,
      select: foundation.select,
      setPopupVisible: foundation.popup,
      scrollIntoView(key) {
        virtual.current?.scrollTo({ key });
        const wrapper = dropdown.current?.wrapperRef;
        const element = elements.current.get(key);
        if (!wrapper || !element || wrapper.scrollHeight === wrapper.offsetHeight) return;
        const rect = getRelativeRect(element, wrapper);
        if (rect.top < 0) wrapper.scrollTo(0, wrapper.scrollTop + rect.top);
        else if (rect.bottom < 0) wrapper.scrollTo(0, wrapper.scrollTop - rect.bottom);
      },
      afterRender(task) {
        void afterRender().then(task);
      },
    }),
  );
  const previousValue = useRef(controlled);
  useLayoutEffect(() => {
    if (previousValue.current !== controlled) foundation.syncValue(controlled);
    previousValue.current = controlled;
  }, [controlled, foundation]);
  useLayoutEffect(() => foundation.syncDisabled(), [form.mergedDisabled, readonly, foundation]);
  const signature = JSON.stringify(enabled);
  const previousKeys = useRef(signature);
  useLayoutEffect(() => {
    if (previousKeys.current !== signature) navigation.enabledKeysChanged(enabled);
    previousKeys.current = signature;
  }, [signature, navigation]);
  useLayoutEffect(() => {
    if (visible) navigation.opened();
  }, [visible, navigation]);
  useImperativeHandle(
    ref,
    () => ({
      get inputRef() {
        return input.current;
      },
      focus: () => input.current?.focus(),
      blur: () => input.current?.blur(),
    }),
    [],
  );
  const optionId = (key: string) => `${optionPrefix}-${uid}-${key}`;
  const renderOptionNode = (option: SelectOptionInfo | SelectOptionGroupInfo): ReactNode => {
    if (isGroupOptionInfo(option)) {
      const Group = virtualProps ? 'div' : 'li';
      const List = virtualProps ? 'div' : 'ul';
      return (
        <Group key={option.key} role="group" aria-label={option.label} className={groupPrefix}>
          <div className={`${groupPrefix}-title`}>
            <Ellipsis>{option.label}</Ellipsis>
          </div>
          <List role="presentation" className={listPrefix}>
            {option.options.map(renderOptionNode)}
          </List>
        </Group>
      );
    }
    const Tag = virtualProps ? 'div' : 'li';
    return (
      <Tag
        key={option.key}
        id={optionId(option.key)}
        ref={(node: HTMLElement | null) => {
          if (node) elements.current.set(option.key, node);
          else elements.current.delete(option.key);
        }}
        role="option"
        aria-disabled={option.disabled || undefined}
        className={[
          optionPrefix,
          local.current.active === option.key && `${optionPrefix}-active`,
          option.disabled && `${optionPrefix}-disabled`,
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={(event) => {
          if (!option.disabled) foundation.select(option.key, event.nativeEvent);
        }}
        onMouseEnter={() => {
          if (!option.disabled) setActive(option.key);
        }}
        onMouseLeave={() => {
          if (!option.disabled) setActive();
        }}
      >
        <span className={`${optionPrefix}-content`}>
          {renderOption ? renderOption(option) : <Ellipsis>{option.label}</Ellipsis>}
        </span>
      </Tag>
    );
  };
  return (
    <Trigger
      trigger="focus"
      position="bl"
      animationName="slide-dynamic-origin"
      autoFitTransformOrigin
      popupVisible={visible}
      clickToClose={false}
      preventFocus
      popupOffset={4}
      disabled={form.mergedDisabled}
      autoFitPopupWidth
      popupContainer={popupContainer}
      referenceElement={target}
      {...triggerProps}
      floatingOptions={floatingOptions ?? triggerProps?.floatingOptions}
      onPopupVisibleChange={(next) => {
        triggerProps?.onPopupVisibleChange?.(next);
        foundation.popup(next);
      }}
      content={
        <SelectDropdown
          ref={dropdown}
          className={`${prefix}-dropdown`}
          footer={footer}
          onScroll={onDropdownScroll}
          onReachBottom={onDropdownReachBottom}
          virtualList={
            virtualProps && (
              <VirtualList
                {...virtualProps}
                ref={virtual}
                items={valid}
                onScroll={(event) => {
                  virtualProps.onScroll?.(event);
                  onDropdownScroll?.(event);
                }}
                onReachBottom={(event) => {
                  virtualProps.onReachBottom?.(event);
                  onDropdownReachBottom?.(event);
                }}
              >
                {({ item }) => renderOptionNode(item)}
              </VirtualList>
            )
          }
        >
          {valid.map(renderOptionNode)}
        </SelectDropdown>
      }
    >
      <span ref={host} style={{ display: 'contents' }}>
        <Input
          {...inputProps}
          ref={input}
          value={current}
          allowClear={mergedClear}
          disabled={form.mergedDisabled}
          readonly={readonly}
          onInput={(next, event) => {
            onInput?.(next, event);
            foundation.input(next);
          }}
          onClear={foundation.clear}
          inputAttrs={{
            ...inputAttrs,
            'role': 'combobox',
            'aria-haspopup': 'listbox',
            'aria-expanded': visible,
            'aria-autocomplete': 'list',
            'aria-activedescendant':
              visible && local.current.active ? optionId(local.current.active) : undefined,
            'onKeyDown': (event) => {
              inputAttrs?.onKeyDown?.(event);
              onKeyDown?.(event.nativeEvent);
              navigation.keydown(event.key, event.nativeEvent, event.nativeEvent.isComposing);
            },
          }}
        />
      </span>
    </Trigger>
  );
}
export default AutoComplete;
