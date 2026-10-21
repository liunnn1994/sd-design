export interface ConfigPropState<T> {
  readonly hasLocalProp: boolean;
  readonly localValue: T;
  readonly globalValue: T | undefined;
}

export function resolveConfigProp<T>(state: ConfigPropState<T>): T | undefined {
  if (state.hasLocalProp) {
    return state.localValue;
  }
  return state.globalValue ?? state.localValue;
}

export interface DropdownVirtualListState<T> {
  readonly hasLocalProp: boolean;
  readonly localValue: T | undefined;
  readonly globalValue: T | undefined;
}

export function resolveDropdownVirtualList<T>(state: DropdownVirtualListState<T>): T | undefined {
  const localVirtualListProps = state.localValue;
  if (state.hasLocalProp || localVirtualListProps !== undefined) {
    return localVirtualListProps;
  }
  return state.globalValue ?? localVirtualListProps;
}

export interface AllowClearState {
  readonly hasLocalProp: boolean;
  readonly localValue: boolean | undefined;
  readonly globalValue: boolean | undefined;
}

export function resolveAllowClear(state: AllowClearState): boolean | undefined {
  if (state.hasLocalProp) {
    return state.localValue;
  }
  if (state.globalValue === true) {
    return true;
  }
  return state.localValue;
}

export interface AllowSearchState<T> {
  readonly hasLocalProp: boolean;
  readonly hasCompatProp: boolean;
  readonly localValue: T | undefined;
  readonly compatValue: T | undefined;
  readonly globalValue: boolean | undefined;
  readonly defaultValue: T | undefined;
}

export function resolveAllowSearch<T>(state: AllowSearchState<T>): T | undefined {
  if (state.hasLocalProp) {
    return state.localValue;
  }
  if (state.hasCompatProp) {
    return state.compatValue;
  }
  if (state.globalValue === true) {
    return true as T;
  }
  return state.defaultValue ?? state.localValue;
}
