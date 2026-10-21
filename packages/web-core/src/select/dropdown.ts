export interface SelectDropdownState {
  readonly bottomOffset: number;
}

export function createSelectDropdownFoundation(
  state: SelectDropdownState,
  onScroll: (event: Event) => void,
  onReachBottom: (event: Event) => void,
) {
  const handleScroll = (e: Event) => {
    const { scrollTop, scrollHeight, offsetHeight } = e.target as HTMLElement;
    const bottom = scrollHeight - (scrollTop + offsetHeight);
    if (bottom <= state.bottomOffset) {
      onReachBottom(e);
    }
    onScroll(e);
  };
  return { handleScroll };
}
