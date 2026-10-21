export interface InputLabelProps<T extends { label: string }> {
  readonly modelValue?: T | undefined;
  readonly enabledInput?: boolean | undefined;
  readonly placeholder?: string | undefined;
  readonly formatLabel?: ((data?: T) => string) | undefined;
}

export interface InputLabelState {
  readonly focused: boolean;
  readonly inputValue: string;
}

export function createInputLabelFoundation<T extends { label: string }>(
  props: InputLabelProps<T>,
  state: InputLabelState,
) {
  const getShowInput = () => (props.enabledInput && state.focused) || !props.modelValue;
  const formatLabel = () =>
    props.modelValue ? (props.formatLabel?.(props.modelValue) ?? props.modelValue.label) : '';
  const getPlaceholder = () =>
    props.enabledInput && props.modelValue ? formatLabel() : props.placeholder;
  const getFitWidthText = () => state.inputValue || formatLabel() || props.placeholder;
  return { getShowInput, formatLabel, getPlaceholder, getFitWidthText };
}
