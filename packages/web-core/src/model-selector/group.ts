export function getModelSelectorGroupInitialExpanded(
  hasHeading: unknown,
  defaultExpanded: boolean,
) {
  return hasHeading ? defaultExpanded : true;
}
export interface ModelSelectorGroupState {
  readonly query: string;
  readonly isSearching: boolean;
  readonly isExpanded: boolean;
  expanded: boolean;
  searchExpanded: boolean | undefined;
}
export function createModelSelectorGroupFoundation(state: ModelSelectorGroupState) {
  function getIsSearching() {
    return state.query.trim().length > 0;
  }
  function getIsExpanded() {
    return state.isSearching ? (state.searchExpanded ?? true) : state.expanded;
  }
  function toggleExpanded() {
    if (state.isSearching) {
      state.searchExpanded = !state.isExpanded;
    } else {
      state.expanded = !state.expanded;
    }
  }
  function syncQuery() {
    state.searchExpanded = undefined;
  }
  return { getIsSearching, getIsExpanded, toggleExpanded, syncQuery };
}
