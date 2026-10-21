import type { TagData, TagDataInfo } from './types.js';

import { isNull, isObject, isUndefined } from '../_utils/is.js';
import { Backspace, Enter } from '../_utils/keycode.js';
import { isReadonlyModificationKey } from '../text-input/readonly.js';

export function getRetainedTagInput(value: boolean | { create?: boolean; blur?: boolean }) {
  return isObject(value)
    ? { create: false, blur: false, ...value }
    : { create: value, blur: value };
}

export function getVisibleTagCount(max: number | 'responsive', count: number) {
  return typeof max === 'number' && max > 0 ? Math.min(max, count) : count;
}

export function getDisplayTags<P>(data: TagDataInfo<P>[], visible: number): TagDataInfo<P>[] {
  const tags = data.slice(0, visible);
  const hidden = Math.max(data.length - visible, 0);
  if (!hidden) return tags;
  const raw = { value: '__sd__more', label: `+${hidden}`, closable: false };
  return tags.concat({ raw, ...raw });
}

export function createInputTag<P extends { closable?: boolean }>(adapter: {
  readonly props: {
    readonly: boolean | string;
    uniqueValue: boolean;
    retainInputValue: boolean | { create?: boolean; blur?: boolean };
  };
  readonly disabled: boolean;
  readonly value: Array<string | number | TagData<P>>;
  readonly inputValue: string;
  readonly data: TagDataInfo<P>[];
  readonly renderedTagCount: number;
  readonly replacingInput: boolean;
  readonly input: HTMLInputElement | undefined;
  composition: boolean;
  compositionValue: string;
  focused: boolean;
  setInner(value: Array<string | number | TagData<P>>): void;
  setInput(value: string): void;
  afterRender(callback: () => void): void;
  onInputUpdate(value: string): void;
  onInputChange(value: string, event: Event): void;
  onUpdate(value: Array<string | number | TagData<P>>): void;
  onChange(value: Array<string | number | TagData<P>>, event: Event): void;
  onFormChange(event: Event): void;
  onRemove(value: string | number, event: Event): void;
  onClear(event: MouseEvent): void;
  onPressEnter(value: string, event: KeyboardEvent): void;
  onFocus(event: FocusEvent): void;
  onBlur(event: FocusEvent): void;
  showReadonlyTip(): void;
}) {
  function updateInput(value: string, event: Event) {
    adapter.setInput(value);
    adapter.onInputUpdate(value);
    adapter.onInputChange(value, event);
  }
  function restoreInput() {
    if (adapter.input && adapter.inputValue !== adapter.input.value)
      adapter.input.value = adapter.inputValue;
  }
  function update(value: Array<string | number | TagData<P>>, event: Event) {
    adapter.setInner(value);
    adapter.onUpdate(value);
    adapter.onChange(value, event);
    adapter.onFormChange(event);
  }
  function closable(item: TagDataInfo<P>) {
    return (
      !adapter.disabled &&
      !adapter.props.readonly &&
      Boolean(item.tagProps?.closable ?? item.closable)
    );
  }
  function remove(value: string | number, index: number, event: Event) {
    const item = adapter.data[index];
    if (!item || !closable(item)) return;
    update(
      adapter.value?.filter((_, itemIndex) => itemIndex !== index),
      event,
    );
    adapter.onRemove(value, event);
  }
  function pressEnter(event: KeyboardEvent) {
    if (!adapter.inputValue) return;
    event.preventDefault();
    if (
      adapter.props.uniqueValue &&
      adapter.data.some((item) => item.value === adapter.inputValue)
    ) {
      adapter.onPressEnter(adapter.inputValue, event);
      return;
    }
    update(adapter.value.concat(adapter.inputValue), event);
    adapter.onPressEnter(adapter.inputValue, event);
    if (!getRetainedTagInput(adapter.props.retainInputValue).create) updateInput('', event);
  }
  return {
    closable,
    remove,
    syncValue(value: unknown) {
      if (isUndefined(value) || isNull(value)) adapter.setInner([]);
    },
    input(event: Event) {
      if (!adapter.composition) {
        updateInput((event.target as HTMLInputElement).value, event);
        adapter.afterRender(restoreInput);
      }
    },
    composition(event: CompositionEvent) {
      const { value } = event.target as HTMLInputElement;
      if (event.type === 'compositionend') {
        adapter.composition = false;
        adapter.compositionValue = '';
        updateInput(value, event);
        adapter.afterRender(restoreInput);
      } else {
        adapter.composition = true;
        adapter.compositionValue = adapter.inputValue + (event.data ?? '');
      }
    },
    mousedown(event: MouseEvent) {
      if (adapter.input && event.target !== adapter.input) {
        event.preventDefault();
        adapter.input.focus();
      }
    },
    clear(event: MouseEvent) {
      update([], event);
      adapter.onClear(event);
    },
    focus(event: FocusEvent) {
      adapter.focused = true;
      adapter.onFocus(event);
    },
    blur(event: FocusEvent) {
      adapter.focused = false;
      if (
        !adapter.replacingInput &&
        !getRetainedTagInput(adapter.props.retainInputValue).blur &&
        adapter.inputValue
      )
        updateInput('', event);
      adapter.onBlur(event);
    },
    keydown(event: KeyboardEvent) {
      if (adapter.props.readonly && !adapter.disabled && isReadonlyModificationKey(event))
        adapter.showReadonlyTip();
      if (adapter.disabled || adapter.props.readonly) return;
      const key = event.key || event.code;
      if (!adapter.composition && adapter.inputValue && key === Enter.key) pressEnter(event);
      if (
        !adapter.composition &&
        adapter.renderedTagCount &&
        !adapter.inputValue &&
        key === Backspace.key
      ) {
        for (let index = adapter.data.length - 1; index >= 0; index--) {
          if (closable(adapter.data[index])) {
            remove(adapter.data[index].value, index, event);
            break;
          }
        }
      }
    },
    syncInput() {
      if (!adapter.composition) restoreInput();
    },
    attachInput() {
      if (adapter.input) adapter.input.value = adapter.inputValue;
    },
  };
}
