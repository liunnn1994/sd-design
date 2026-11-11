import type {
  FilterOption,
  SelectOption,
  SelectOptionInfo,
  SelectOptionValue,
} from '@sdata/web-core/select/types';
import type { DOMAttributes, ReactNode, Ref } from 'react';

import { getRelativeRect } from '@sdata/web-core/_utils/dom';
import { resolveAllowClear } from '@sdata/web-core/config/prop-values';
import { createMention, getEmptyMeasureInfo } from '@sdata/web-core/mention/foundation';
import { createSelectNavigation } from '@sdata/web-core/select/navigation';
import {
  DEFAULT_FIELD_NAMES,
  getOptionInfos,
  isValidOption,
  getKeyFromValue,
} from '@sdata/web-core/select/options';
import { getSizeStyles } from '@sdata/web-core/textarea/size';
import { useId, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';

import type { TextInputEventNames } from '../_shared/use-text-input.js';

import { useAfterRender } from '../_shared/use-after-render.js';
import { useConfig, usePrefix } from '../config-provider/index.js';
import { useFormItem } from '../form/context.js';
import { Input, type InputInstance, type InputProps } from '../input/index.js';
import { SelectDropdown, type SelectDropdownRef } from '../select/dropdown.js';
import { Textarea, type TextareaInstance, type TextareaProps } from '../textarea/index.js';
import { Trigger, type TriggerProps } from '../trigger/index.js';
export type { MeasureInfo } from '@sdata/web-core/mention/types';
export interface MentionInstance {
  readonly inputRef: InputInstance | TextareaInstance | null;
  focus(): void;
  blur(): void;
}
export interface MentionProps
  extends
    Omit<
      InputProps,
      'prefix' | 'type' | 'ref' | 'onChange' | 'onSelect' | 'onClear' | TextInputEventNames
    >,
    Pick<DOMAttributes<HTMLInputElement | HTMLTextAreaElement>, TextInputEventNames> {
  modelValue?: string | null;
  data?: SelectOption[];
  prefix?: string | string[];
  split?: string;
  filterOption?: FilterOption;
  type?: 'input' | 'textarea';
  floatingOptions?: TriggerProps['floatingOptions'];
  prefixContent?: ReactNode;
  renderOption?: (data: SelectOptionInfo) => ReactNode;
  autoSize?: TextareaProps['autoSize'];
  textareaAttrs?: TextareaProps['textareaAttrs'];
  onChange?: (value: string) => void;
  onSelect?: (value: SelectOptionValue | undefined) => void;
  onSearch?: (value: string, prefix: string) => void;
  onClear?: (event: Event) => void;
  ref?: Ref<MentionInstance>;
}
export function Mention(props: MentionProps) {
  const {
    value: _value,
    modelValue,
    defaultValue = '',
    data = [],
    prefix: _prefix,
    split: _split,
    filterOption = true,
    type = 'input',
    readonly = false,
    disabled: _disabled,
    allowClear = false,
    fitWidth = false,
    maxWFull = true,
    floatingOptions,
    prefixContent,
    renderOption,
    autoSize,
    textareaAttrs,
    onValueChange: _onValueChange,
    onChange: _onChange,
    onSelect: _onSelect,
    onSearch: _onSearch,
    onClear: _onClear,
    onInput,
    onKeyDown,
    inputAttrs,
    ref,
    ...inputProps
  } = props;
  const cls = usePrefix('mention');
  const optionCls = usePrefix('select-option');
  const uid = useId();
  const config = useConfig();
  const form = useFormItem(props);
  const input = useRef<InputInstance>(null);
  const textarea = useRef<TextareaInstance>(null);
  const dropdown = useRef<SelectDropdownRef>(null);
  const host = useRef<HTMLDivElement>(null);
  const mirror = useRef<HTMLDivElement>(null);
  const elements = useRef(new Map<string, HTMLElement>());
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [, render] = useState(0);
  const refresh = () => render((version) => version + 1);
  const local = useRef({
    value: defaultValue,
    popup: false,
    active: undefined as string | undefined,
    measure: getEmptyMeasureInfo(),
  });
  const controlled = modelValue !== undefined ? modelValue : props.value;
  const current = controlled ?? local.current.value;
  const map = new Map<string, SelectOptionInfo>();
  getOptionInfos(data, {
    valueKey: 'value',
    fieldNames: DEFAULT_FIELD_NAMES,
    origin: 'options',
    optionInfoMap: map,
  });
  const valid = [...map.values()].filter((option) =>
    isValidOption(option, { inputValue: local.current.measure.text, filterOption }),
  );
  const enabled = valid.filter((option) => !option.disabled).map((option) => option.key);
  const visible =
    !form.mergedDisabled &&
    !readonly &&
    local.current.popup &&
    local.current.measure.measuring &&
    valid.length > 0;
  const afterRender = useAfterRender();
  const live = useRef({ props, form, current, map, enabled, visible });
  live.current = { props, form, current, map, enabled, visible };
  const [foundation] = useState(() =>
    createMention({
      get props() {
        return {
          prefix: live.current.props.prefix ?? '@',
          split: live.current.props.split ?? ' ',
          readonly: live.current.props.readonly ?? false,
        };
      },
      get value() {
        return live.current.current;
      },
      get options() {
        return live.current.map;
      },
      get measure() {
        return local.current.measure;
      },
      set measure(value) {
        local.current.measure = value;
        refresh();
      },
      setInner(value) {
        local.current.value = value;
        refresh();
      },
      setPopup(value) {
        if (value !== local.current.popup) {
          local.current.popup = value;
          refresh();
        }
      },
      onSearch: (value, prefix) => live.current.props.onSearch?.(value, prefix),
      onUpdate: (value) => live.current.props.onValueChange?.(value),
      onChange: (value) => live.current.props.onChange?.(value),
      onFormChange: () => live.current.form.eventHandlers?.onChange?.(),
      onSelect: (value) => live.current.props.onSelect?.(value),
      onClear: (event) => live.current.props.onClear?.(event),
    }),
  );
  const setActive = (value?: string) => {
    if (value !== local.current.active) {
      local.current.active = value;
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
      getEnterToOpen: () => false,
      setActiveKey: setActive,
      select: foundation.select,
      setPopupVisible: foundation.popup,
      scrollIntoView(key) {
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
  const previous = useRef(controlled);
  useLayoutEffect(() => {
    if (previous.current !== controlled) foundation.syncValue(controlled);
    previous.current = controlled;
  }, [controlled, foundation]);
  const signature = JSON.stringify(enabled);
  const previousKeys = useRef(signature);
  useLayoutEffect(() => {
    if (previousKeys.current !== signature) navigation.enabledKeysChanged(enabled);
    previousKeys.current = signature;
  }, [signature, navigation]);
  useLayoutEffect(() => {
    if (visible) navigation.opened();
  }, [visible, navigation]);
  useLayoutEffect(() => {
    const next = host.current?.firstElementChild;
    const node = next instanceof HTMLElement ? next : null;
    if (node !== target) setTarget(node);
    const field = host.current?.querySelector('textarea');
    if (field && mirror.current) {
      for (const [name, value] of Object.entries(getSizeStyles(getComputedStyle(field))))
        mirror.current.style.setProperty(name, value);
      if (visible) mirror.current.scrollTop = field.scrollTop;
    }
  });
  useLayoutEffect(() => {
    const field = host.current?.querySelector('textarea');
    if (!field) return;
    const observer = new ResizeObserver(() => {
      if (mirror.current)
        for (const [name, value] of Object.entries(getSizeStyles(getComputedStyle(field))))
          mirror.current.style.setProperty(name, value);
    });
    observer.observe(field);
    return () => observer.disconnect();
  }, [type]);
  useImperativeHandle(
    ref,
    () => ({
      get inputRef() {
        return live.current.props.type === 'textarea' ? textarea.current : input.current;
      },
      focus() {
        (live.current.props.type === 'textarea' ? textarea.current : input.current)?.focus();
      },
      blur() {
        (live.current.props.type === 'textarea' ? textarea.current : input.current)?.blur();
      },
    }),
    [],
  );
  const optionId = (key: string) => `${optionCls}-${uid}-${key}`;
  const content = (
    <SelectDropdown ref={dropdown} className={`${cls}-dropdown`}>
      {valid.map((option) => (
        <li
          key={option.key}
          id={optionId(option.key)}
          ref={(node) => {
            if (node) elements.current.set(option.key, node);
            else elements.current.delete(option.key);
          }}
          role="option"
          aria-disabled={option.disabled || undefined}
          className={[
            optionCls,
            local.current.active === option.key && `${optionCls}-active`,
            option.disabled && `${optionCls}-disabled`,
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
          <span className={`${optionCls}-content`}>
            {renderOption ? renderOption(option) : option.label}
          </span>
        </li>
      ))}
    </SelectDropdown>
  );
  const keydown = (event: KeyboardEvent) => {
    onKeyDown?.(event);
    navigation.keydown(event.key, event, event.isComposing);
  };
  const common = {
    ...inputProps,
    value: current,
    readonly,
    disabled: form.mergedDisabled,
    fitWidth,
    maxWFull,
    allowClear: resolveAllowClear({
      hasLocalProp: Object.hasOwn(props, 'allowClear'),
      localValue: allowClear,
      globalValue: config.allowClear,
    }),
    onInput: (value: string, event: Event) => {
      onInput?.(value, event);
      foundation.input(value, event);
    },
    onClear: foundation.clear,
  };
  const trigger = {
    trigger: 'focus' as const,
    position: 'bl' as const,
    popupOffset: 4,
    preventFocus: true,
    popupVisible: visible,
    clickToClose: false,
    floatingOptions,
    onPopupVisibleChange: foundation.popup,
    content,
  };
  if (type === 'textarea')
    return (
      <div
        className={[cls, fitWidth && `${cls}-fit-width`, maxWFull && `${cls}-max-w-full`]
          .filter(Boolean)
          .join(' ')}
      >
        <div ref={host} style={{ display: 'contents' }}>
          <Textarea
            {...common}
            ref={textarea}
            autoSize={autoSize}
            textareaAttrs={{
              ...textareaAttrs,
              onKeyDown: (event) => {
                textareaAttrs?.onKeyDown?.(event);
                keydown(event.nativeEvent);
              },
            }}
          />
        </div>
        {local.current.measure.measuring && valid.length > 0 && (
          <div ref={mirror} className={`${cls}-measure`} aria-hidden="true">
            {current.slice(0, local.current.measure.location)}
            <Trigger {...trigger}>
              <span>@</span>
            </Trigger>
          </div>
        )}
      </div>
    );
  return (
    <Trigger
      {...trigger}
      animationName="slide-dynamic-origin"
      autoFitTransformOrigin
      autoFitPopupWidth
      disabled={form.mergedDisabled}
      referenceElement={target}
    >
      <div ref={host} style={{ display: 'contents' }}>
        <Input
          {...common}
          ref={input}
          prefix={prefixContent}
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
              keydown(event.nativeEvent);
            },
          }}
        />
      </div>
    </Trigger>
  );
}
export default Mention;
