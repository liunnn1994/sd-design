export function createSelectViewFocus(state: { readonly input: HTMLInputElement | undefined }) {
  const focus = () => state.input?.focus();
  const blur = () => state.input?.blur();
  const syncOpened = (opened: boolean) => {
    if (!opened && state.input?.isSameNode(document.activeElement)) {
      state.input.blur();
    }
  };
  return { focus, blur, syncOpened };
}
