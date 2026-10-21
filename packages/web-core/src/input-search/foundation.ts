export interface InputSearchState {
  readonly input: { readonly disabled: boolean; readonly value: string } | undefined;
}

export function createInputSearchFoundation(
  state: InputSearchState,
  onSearch: (value: string, event: MouseEvent) => void,
) {
  const handleClick = (event: MouseEvent) => {
    const input = state.input;
    if (input && !input.disabled) {
      onSearch(input.value, event);
    }
  };
  return { handleClick };
}
