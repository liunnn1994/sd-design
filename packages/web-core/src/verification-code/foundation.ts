import { isExist, isFunction, isString, isUndefined } from '../_utils/is.js';
import { ArrowLeft, ArrowRight, Backspace } from '../_utils/keycode.js';

export interface VerificationCell {
  focus(): void;
  blur(): void;
  inputRef: HTMLInputElement | null | undefined;
}

export function getVerificationCells(value: unknown, length: number): string[] {
  const characters = String(value).split('');
  return Array.from({ length }, (_, index) =>
    isExist(characters[index]) ? String(characters[index]) : '',
  );
}

export function createVerificationCode(adapter: {
  readonly props: {
    modelValue?: string;
    length: number;
    readonly: boolean | string;
    disabled: boolean;
    formatter?: (input: string, index: number, value: string) => string | boolean;
  };
  readonly filled: string[];
  readonly cells: readonly VerificationCell[];
  readonly activeElement: Element | null;
  inner: string[];
  afterRender(callback: () => void): void;
  onUpdate(value: string): void;
  onChange(value: string): void;
  onFinish(value: string): void;
  onInput(value: string, index: number, event: Event): void;
}) {
  function focusAt(index: number) {
    adapter.cells[index]?.focus();
  }
  function focusEmpty(index?: number) {
    const values = adapter.inner;
    if (!isUndefined(index) && values[index]) return;
    const empty = values.findIndex((value) => !value);
    focusAt(empty === -1 ? values.length - 1 : empty);
  }
  function keepControl(previous: string | undefined) {
    if (adapter.props.modelValue === undefined || adapter.props.modelValue !== previous) return;
    const restored = adapter.filled.slice();
    adapter.inner = restored;
    adapter.cells.forEach((cell, index) => {
      const element = cell?.inputRef;
      if (element && element.value !== restored[index]) element.value = restored[index];
    });
  }
  function update() {
    const value = adapter.inner.join('').trim();
    const previous = adapter.props.modelValue;
    adapter.onUpdate(value);
    adapter.onChange(value);
    if (value.length === adapter.props.length) adapter.onFinish(value);
    focusEmpty();
    adapter.afterRender(() => keepControl(previous));
  }
  return {
    focusEmpty,
    syncValue(value: string, previous: string) {
      adapter.inner =
        adapter.props.modelValue === undefined && value === previous
          ? adapter.filled.map((_, index) => adapter.inner[index] ?? '')
          : adapter.filled.slice();
    },
    cursorToEnd(event: MouseEvent, index: number) {
      if (!adapter.inner[index]) return;
      const target = event.target as HTMLInputElement;
      if (!target?.setSelectionRange) return;
      event.preventDefault();
      target.focus();
      const end = target.value.length;
      target.setSelectionRange(end, end);
    },
    paste(event: ClipboardEvent, index: number) {
      if (adapter.props.readonly || adapter.props.disabled) return;
      event.preventDefault();
      const text = event.clipboardData?.getData('text');
      if (!text) return;
      text.split('').forEach((original, offset) => {
        let character = original;
        if (index + offset >= adapter.props.length) return;
        if (isFunction(adapter.props.formatter)) {
          const result = adapter.props.formatter(character, index + offset, adapter.inner.join(''));
          if (result === false) {
            index -= 1;
            return;
          }
          if (isString(result)) character = result.charAt(0);
        }
        adapter.inner[index + offset] = character;
      });
      update();
    },
    keydown(index: number, event: KeyboardEvent) {
      const key = event.code || event.key;
      if (
        key === Backspace.code &&
        !adapter.inner[index] &&
        !adapter.props.readonly &&
        !adapter.props.disabled
      ) {
        event.preventDefault();
        adapter.inner[Math.max(index - 1, 0)] = '';
        update();
      } else if (key === ArrowLeft.code && index > 0) {
        event.preventDefault();
        focusAt(index - 1);
      } else if (
        key === ArrowRight.code &&
        adapter.inner[index] &&
        index < adapter.props.length - 1
      ) {
        event.preventDefault();
        focusAt(index + 1);
      }
    },
    input(index: number, value: string, event: Event) {
      const trimmed = (value || '').trim();
      let character = trimmed.charAt(trimmed.length - 1);
      adapter.onInput(character, index, event);
      if (isFunction(adapter.props.formatter)) {
        const result = adapter.props.formatter(character, index, adapter.inner.join(''));
        if (result === false) return;
        if (isString(result)) character = result.charAt(0);
      }
      adapter.inner[index] = character;
      update();
    },
    focus() {
      focusEmpty();
    },
    blur() {
      const active = adapter.activeElement;
      const cell = adapter.cells.find((cell) => cell?.inputRef === active);
      cell?.blur();
    },
  };
}
