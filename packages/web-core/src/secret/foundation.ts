export function createSecretFoundation(state: { visible: boolean }) {
  return {
    get labelKey() {
      return state.visible ? ('a11y.secretHide' as const) : ('a11y.secretShow' as const);
    },
    toggle() {
      state.visible = !state.visible;
    },
  };
}
