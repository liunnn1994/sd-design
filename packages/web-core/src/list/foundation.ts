export interface ListState<TItem> {
  readonly pagination: unknown;
  readonly current: number;
  readonly pageSize: number;
  readonly bottomOffset: number;
  readonly gridSpan: number | undefined;
  readonly gridRowSize: number;
  readonly currentPageItems: TItem[];
}
export function createListFoundation<TItem>(
  state: ListState<TItem>,
  onScroll: () => void,
  onReachBottom: () => void,
) {
  let previousScrollTop = 0;

  const handleScroll = (event: Event) => {
    const { scrollTop, scrollHeight, offsetHeight } = event.target as HTMLElement;
    const bottom = Math.floor(scrollHeight - (scrollTop + offsetHeight));
    if (scrollTop > previousScrollTop && bottom <= state.bottomOffset) onReachBottom();
    onScroll();
    previousScrollTop = scrollTop;
  };

  const checkInitialViewport = (
    viewport: Pick<HTMLElement, 'scrollTop' | 'scrollHeight' | 'clientHeight'> | undefined,
  ) => {
    if (viewport) {
      const { scrollTop, scrollHeight, clientHeight } = viewport;
      if (scrollHeight <= scrollTop + clientHeight) onReachBottom();
    }
  };
  const getCurrentPageItems = (data: TItem[]) => {
    if (!state.pagination) return data;
    if (data.length > state.pageSize) {
      const startIndex = (state.current - 1) * state.pageSize;
      return data.slice(startIndex, startIndex + state.pageSize);
    }
    return data;
  };

  const getGridRowSize = () => Math.max(1, Math.floor(24 / (state.gridSpan || 24)));
  const getGridRows = () => {
    const span = state.gridSpan;
    if (!span) return [];
    const rowSize = state.gridRowSize;
    const rows: TItem[][] = [];
    for (let index = 0; index < state.currentPageItems.length; index += rowSize)
      rows.push(state.currentPageItems.slice(index, index + rowSize));
    return rows;
  };
  return { handleScroll, checkInitialViewport, getCurrentPageItems, getGridRowSize, getGridRows };
}
