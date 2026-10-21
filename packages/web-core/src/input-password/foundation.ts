export interface InputPasswordState {
  /** True renders a masked password; false renders plaintext. */
  readonly masked: boolean;
}
export function createInputPasswordFoundation(
  state: InputPasswordState,
  onVisibilityChange: (masked: boolean) => void,
  onUpdateVisibility: (masked: boolean) => void,
  setLocalVisibility: (masked: boolean) => void,
) {
  const setMasked = (newMasked: boolean) => {
    if (newMasked !== state.masked) {
      onVisibilityChange(newMasked);
      onUpdateVisibility(newMasked);
      setLocalVisibility(newMasked);
    }
  };
  const toggle = () => {
    setMasked(!state.masked);
  };
  return { setMasked, toggle };
}
