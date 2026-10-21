import type { SetRequired } from 'type-fest';

import type {
  InputMaskProps,
  InputMaskState,
  InputMaskSelection,
  InputMaskPattern,
  InputMaskPresetName,
  InputMaskPresetDefinition,
} from './types.js';

import { splitGraphemes } from '../_utils/grapheme.js';
import { formatInputMask, resolveDeletion, stripMaskPlaceholders } from './mask-engine.js';
export interface InputMaskFoundationState {
  readonly props: SetRequired<InputMaskProps, 'defaultValue' | 'maskChar' | 'alwaysShowMask'>;
  readonly presets: Readonly<Record<InputMaskPresetName, InputMaskPresetDefinition>>;
  readonly inputElement: HTMLInputElement | undefined;
  focused: boolean;
  lastSelection: InputMaskSelection | null;
  complete: boolean;
  innerValue: string;
  readonly presetDefinition: InputMaskPresetDefinition | undefined;
  readonly effectiveMask: InputMaskPattern | undefined;
  readonly effectiveFormatChars: Readonly<Record<string, RegExp>>;
  readonly effectiveMaskChar: string | null;
  readonly hasValue: boolean;
}
export function createInputMaskFoundation(
  state: InputMaskFoundationState,
  callbacks: {
    update(value: string): void;
    complete(value: string): void;
    input(value: string, event: Event): void;
    change(value: string, event: Event): void;
    pressEnter(event: KeyboardEvent): void;
    clear(event: MouseEvent): void;
    focus(event: FocusEvent): void;
    blur(event: FocusEvent): void;
    afterRender(task: () => void): void;
  },
) {
  const props = state.props;
  function getPresetDefinition(): InputMaskPresetDefinition | undefined {
    return props.preset ? state.presets[props.preset] : undefined;
  }

  function getEffectiveMask(): InputMaskPattern | undefined {
    return props.mask ?? state.presetDefinition?.mask;
  }

  function getEffectiveFormatChars(): Record<string, RegExp> {
    return {
      ...state.presetDefinition?.formatChars,
      ...props.formatChars,
    };
  }

  function getEffectiveMaskChar(): string | null {
    if (props.maskChar === null) return null;
    return splitGraphemes(props.maskChar)[0] ?? '_';
  }

  function getLengthManaged(): boolean {
    return Boolean(state.effectiveMask) || Boolean(props.preset);
  }

  const normalizePresetValue = (value: string, previousValue: string) => {
    const preset = state.presetDefinition;
    if (!preset || state.effectiveMask) return value;
    const normalized = preset.normalize?.(value) ?? value;
    return preset.accepts?.(normalized) === false ? previousValue : normalized;
  };

  const applyNormalization = (value: string): { value: string; complete: boolean } => {
    if (state.effectiveMask) {
      const result = formatInputMask(value, null, state.effectiveMask, {
        maskChar: state.effectiveMaskChar,
        showMask: Boolean(value),
        formatChars: state.effectiveFormatChars,
      });
      return { value: result.value, complete: result.complete };
    }
    return { value: normalizePresetValue(value, ''), complete: false };
  };

  const normalizeStoredValue = (value: string) => applyNormalization(value).value;

  function getDisplayValue(): string {
    if (!state.effectiveMask) return state.innerValue;
    return formatInputMask(state.innerValue, null, state.effectiveMask, {
      maskChar: state.effectiveMaskChar,
      showMask: state.focused || props.alwaysShowMask || state.hasValue,
      formatChars: state.effectiveFormatChars,
    }).value;
  }

  function getMergedInputAttrs(): Record<string, unknown> {
    const result: Record<string, unknown> = { ...props.inputAttrs };
    if (result.inputmode === undefined && state.presetDefinition?.inputMode) {
      result.inputmode = state.presetDefinition.inputMode;
    }
    if (props.preset) {
      result['data-mask-preset'] = props.preset;
    }
    return result;
  }

  const getInputElement = () => state.inputElement;

  const syncComplete = (value: string, nextComplete: boolean) => {
    if (nextComplete && !state.complete) callbacks.complete(value);
    state.complete = nextComplete;
  };

  const toCommittedValue = (value: string) => {
    if (!state.effectiveMask) return value;
    return stripMaskPlaceholders(value, state.effectiveMask, {
      maskChar: state.effectiveMaskChar,
      formatChars: state.effectiveFormatChars,
    });
  };

  function getHasValue(): boolean {
    return Boolean(toCommittedValue(state.innerValue));
  }

  const commitValue = (rawValue: string) => {
    const input = getInputElement();
    const rawCursor = input?.selectionStart ?? rawValue.length;
    const previousState: InputMaskState = {
      value: state.innerValue,
      selection: state.lastSelection,
    };
    let nextState: InputMaskState;
    let nextComplete = false;

    if (state.effectiveMask) {
      const deletion = state.lastSelection
        ? resolveDeletion(
            state.innerValue,
            state.lastSelection,
            rawValue,
            rawCursor,
            state.effectiveMask,
            state.effectiveFormatChars,
            state.effectiveMaskChar,
          )
        : null;

      if (deletion) {
        nextState = {
          value: deletion.value,
          selection: { start: deletion.cursor, end: deletion.cursor },
        };
        nextComplete = deletion.complete;
      } else {
        const result = formatInputMask(rawValue, rawCursor, state.effectiveMask, {
          maskChar: state.effectiveMaskChar,
          showMask: state.focused || props.alwaysShowMask || Boolean(rawValue),
          formatChars: state.effectiveFormatChars,
        });
        nextState = { value: result.value, selection: result.selection };
        nextComplete = result.complete;
      }
    } else {
      const value = normalizePresetValue(rawValue, state.innerValue);
      // A rejected mid-string insertion (or one whose characters the preset
      // normalization strips) leaves the raw cursor one slot past the removed
      // character; without the -1 correction the restored cursor drifts.
      const rejectedInsertion =
        value === state.innerValue && rawValue.length === state.innerValue.length + 1;
      const cursor =
        rawCursor === rawValue.length
          ? value.length
          : Math.min(Math.max(rawCursor - (rejectedInsertion ? 1 : 0), 0), value.length);
      nextState = { value, selection: { start: cursor, end: cursor } };
    }

    nextState = props.beforeMaskedValueChange?.(nextState, previousState) ?? nextState;
    if (props.beforeMaskedValueChange) {
      nextComplete = applyNormalization(nextState.value).complete;
    }
    state.innerValue = nextState.value;
    state.lastSelection = nextState.selection;
    const committedValue = toCommittedValue(nextState.value);
    callbacks.update(committedValue);
    syncComplete(committedValue, nextComplete);

    callbacks.afterRender(() => {
      // Nested nextTick: the underlying Input's keepControl() (registered after
      // this callback) rewrites the DOM value and re-derives the cursor when the
      // committed value differs from the raw DOM text; the selection must be
      // applied after that restore or it is overwritten.
      callbacks.afterRender(() => {
        const element = getInputElement();
        if (state.focused && element && nextState.selection) {
          element.setSelectionRange(nextState.selection.start, nextState.selection.end);
        }
      });
    });
  };

  const handleModelUpdate = (value: string) => commitValue(value);

  const handleInput = (_value: string, event: Event) => callbacks.input(state.innerValue, event);

  const handleChange = (_value: string, event: Event) => callbacks.change(state.innerValue, event);

  const handlePressEnter = (event: KeyboardEvent) => callbacks.pressEnter(event);

  const handleClear = (event: MouseEvent) => callbacks.clear(event);

  const handleFocus = (event: FocusEvent) => {
    state.focused = true;
    callbacks.focus(event);
  };

  const handleBlur = (event: FocusEvent) => {
    state.focused = false;
    callbacks.blur(event);
  };

  const trackedEvents: Array<keyof HTMLElementEventMap> = ['keyup', 'mouseup', 'select'];

  const updateSelectionFromDom = () => {
    const el = getInputElement();
    if (!el || document.activeElement !== el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    if (start !== null && end !== null) {
      state.lastSelection = { start, end };
    }
  };

  function mount() {
    const input = getInputElement();
    if (input) {
      trackedEvents.forEach((event) => input.addEventListener(event, updateSelectionFromDom));
    }
    document.addEventListener('selectionchange', updateSelectionFromDom);

    // Establish the initial complete state: a fully-filled initial modelValue
    // mounts as complete (the modelValue watcher below is not immediate).
    if (state.effectiveMask) {
      const { complete: initialComplete } = applyNormalization(state.innerValue);
      syncComplete(toCommittedValue(state.innerValue), initialComplete);
    }
  }

  function dispose() {
    const input = getInputElement();
    if (input) {
      trackedEvents.forEach((event) => input.removeEventListener(event, updateSelectionFromDom));
    }
    document.removeEventListener('selectionchange', updateSelectionFromDom);
  }

  function syncModel(value: string | null | undefined) {
    // Treat undefined (and null) as a reset request instead of early-returning.
    const { value: next, complete: nextComplete } = applyNormalization(value ?? '');
    state.innerValue = next;
    // Echo the normalized value back so a parent that passed a raw string (or
    // null/undefined) stays in sync with the masked representation. The echo
    // and the complete payload use the placeholder-free committed form.
    if (next !== value) callbacks.update(toCommittedValue(next));
    syncComplete(toCommittedValue(next), nextComplete);
  }

  function syncMask(
    _: unknown,
    [oldMask, , oldMaskChar, oldFormatChars]: readonly [
      InputMaskPattern | undefined,
      unknown,
      string | null,
      Readonly<Record<string, RegExp>>,
    ],
  ) {
    const value = oldMask
      ? stripMaskPlaceholders(state.innerValue, oldMask, {
          maskChar: oldMaskChar,
          formatChars: oldFormatChars,
        })
      : state.innerValue;
    const { value: next, complete: nextComplete } = applyNormalization(value);
    const changed = next !== state.innerValue;
    state.innerValue = next;
    // The component changed its own template, so propagate the re-normalized
    // value to keep v-model in sync (otherwise switching mask/preset can desync).
    if (changed) callbacks.update(toCommittedValue(next));
    syncComplete(toCommittedValue(next), nextComplete);
  }

  function initialize() {
    state.innerValue = normalizeStoredValue(props.modelValue ?? props.defaultValue);
  }
  return {
    getPresetDefinition,
    getEffectiveMask,
    getEffectiveFormatChars,
    getEffectiveMaskChar,
    getLengthManaged,
    getDisplayValue,
    getMergedInputAttrs,
    getInputElement,
    getHasValue,
    handleModelUpdate,
    handleInput,
    handleChange,
    handlePressEnter,
    handleClear,
    handleFocus,
    handleBlur,
    mount,
    dispose,
    syncModel,
    syncMask,
    initialize,
  };
}
