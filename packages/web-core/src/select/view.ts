export function createSelectViewFoundation(state: {
  readonly multiple: boolean;
  readonly allowSearch: boolean;
  readonly allowCreate: boolean;
  readonly allowClear: boolean;
  readonly disabled: boolean;
  readonly valueCount: number;
  readonly loading: boolean;
  readonly opened: boolean;
}) {
  return {
    getEnabledInput: () => state.allowSearch || state.allowCreate,
    getShowClear: () => state.allowClear && !state.disabled && state.valueCount > 0,
    getMode: () => (state.multiple ? 'multiple' : 'single'),
    getIconMode: () =>
      state.loading ? 'loading' : state.allowSearch && state.opened ? 'search' : 'arrow',
  };
}
