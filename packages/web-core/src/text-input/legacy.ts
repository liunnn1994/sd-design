import { Enter } from '../_utils/keycode.js';
export interface LegacyInputState {
  readonly input: HTMLInputElement | undefined;
  readonly modelValue: string | undefined;
  readonly computedValue: string;
  readonly eventHandlers:
    | {
        onFocus?: ((event: FocusEvent) => void) | undefined;
        onBlur?: ((event: FocusEvent) => void) | undefined;
      }
    | undefined;
  value: string;
  focused: boolean;
  isComposition: boolean;
  compositionValue: string;
}
export function createLegacyInputFoundation(
  state: LegacyInputState,
  {
    emit,
    afterRender,
    eventName = 'input',
    updateEventName = 'update:modelValue',
  }: {
    emit: (name: string, ...args: unknown[]) => void;
    afterRender: (callback: () => void) => unknown;
    eventName?: string | undefined;
    updateEventName?: string | undefined;
  },
) {
  let initialValue: string;

  const getValue = () => state.modelValue ?? state.value;

  const updateValue = (value: string, ev: Event) => {
    state.value = value;
    emit(updateEventName, value);
    emit(eventName, value, ev);
  };

  const handleInput = (ev: Event) => {
    const { value } = ev.target as HTMLInputElement;

    if (!state.isComposition) {
      updateValue(value, ev);

      afterRender(() => {
        if (state.input && state.computedValue !== state.input.value) {
          state.input.value = state.computedValue;
        }
      });
    }
  };

  const handleChange = (ev: Event) => {
    if (eventName === 'input' && state.computedValue !== initialValue) {
      initialValue = state.computedValue;
      emit('change', state.computedValue, ev);
    }
  };

  const handleComposition = (ev: CompositionEvent) => {
    const { value } = ev.target as HTMLInputElement;

    if (ev.type === 'compositionend') {
      state.isComposition = false;
      state.compositionValue = '';
      updateValue(value, ev);

      afterRender(() => {
        if (state.input && state.computedValue !== state.input.value) {
          state.input.value = state.computedValue;
        }
      });
    } else {
      state.isComposition = true;
      state.compositionValue = state.computedValue + (ev.data ?? '');
    }
  };

  const handleFocus = (ev: FocusEvent) => {
    state.focused = true;
    initialValue = state.computedValue;
    emit('focus', ev);
    state.eventHandlers?.onFocus?.(ev);
  };

  const handleBlur = (ev: FocusEvent) => {
    state.focused = false;
    emit('blur', ev);
    state.eventHandlers?.onBlur?.(ev);
    handleChange(ev);
  };

  const handleKeyDown = (ev: KeyboardEvent) => {
    const keyCode = ev.key || ev.code;
    if (!state.isComposition && keyCode === Enter.key) {
      emit('pressEnter', ev);
      handleChange(ev);
    }
  };

  // used for input wrapper
  const handleMousedown = (ev: MouseEvent) => {
    if (state.input && ev.target !== state.input) {
      ev.preventDefault();
      state.input.focus();
    }
  };

  function syncInput(value: string) {
    if (state.input && value !== state.input.value) {
      state.input.value = value;
    }
  }
  return {
    getValue,
    handleInput,
    handleComposition,
    handleFocus,
    handleBlur,
    handleKeyDown,
    handleMousedown,
    syncInput,
  };
}
