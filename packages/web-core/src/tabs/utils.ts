export const updateScrollOffset = (
  parentNode: HTMLElement,
  direction: 'horizontal' | 'vertical',
) => {
  const { scrollTop, scrollLeft } = parentNode;

  if (direction === 'horizontal' && scrollLeft) {
    parentNode.scrollTo({ left: -1 * scrollLeft });
  }
  if (direction === 'vertical' && scrollTop) {
    parentNode.scrollTo({ top: -1 * scrollTop });
  }
};
