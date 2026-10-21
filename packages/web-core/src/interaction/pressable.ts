export interface PressableState {
  readonly disabled: boolean | undefined;
  readonly loading: boolean;
}

export function createPressableFoundation<E extends { preventDefault(): void }>(
  state: PressableState,
  onClick: (event: E) => void,
) {
  const handleClick = (ev: E) => {
    if (state.disabled || state.loading) {
      ev.preventDefault();
      return;
    }
    onClick(ev);
  };
  return { handleClick };
}
