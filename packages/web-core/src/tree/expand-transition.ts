export function createTreeExpandTransition(
  state: { readonly expanded: boolean },
  emit: (name: 'end') => void,
) {
  const getElement = (el: Element) => el as HTMLDivElement;

  function onEnter(el: Element) {
    const target = getElement(el);
    const endHeight = `${target.scrollHeight}px`;
    target.style.height = state.expanded ? '0' : endHeight;
    // oxlint-disable-next-line no-unused-expressions
    target.getBoundingClientRect();
    target.style.height = state.expanded ? endHeight : '0';
  }
  function onAfterEnter(el: Element) {
    const target = getElement(el);
    target.style.height = state.expanded ? '' : '0';
    emit('end');
  }
  function onBeforeLeave(el: Element) {
    getElement(el).style.display = 'none';
  }
  return { onEnter, onAfterEnter, onBeforeLeave };
}
