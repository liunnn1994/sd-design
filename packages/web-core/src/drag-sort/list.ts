import Sortable from 'sortablejs';

export interface ListSortAdapter {
  draggable: string;
  handle: string;
  ghostClass: string;
  chosenClass: string;
  move: (from: number, to: number) => void;
}

/** Restore the DOM before notifying the framework, which owns keyed rendering. */
export function createListSort(root: HTMLElement, adapter: ListSortAdapter) {
  const sortable = new Sortable(root, {
    animation: 150,
    forceFallback: true,
    fallbackOnBody: true,
    draggable: adapter.draggable,
    handle: adapter.handle,
    ghostClass: adapter.ghostClass,
    chosenClass: adapter.chosenClass,
    onEnd(event) {
      const from = event.oldDraggableIndex;
      const to = event.newDraggableIndex;
      if (from === undefined || to === undefined || from === to) return;
      event.item.remove();
      const before = root.querySelectorAll(adapter.draggable)[from];
      root.insertBefore(event.item, before ?? null);
      adapter.move(from, to);
    },
  });
  return {
    setDisabled(disabled: boolean) {
      sortable.option('disabled', disabled);
    },
    destroy() {
      // Sortable clears these references on destroy without removing fallback DOM.
      const ghost = Sortable.active === sortable ? Sortable.ghost : null;
      const clone = Sortable.active === sortable ? Sortable.clone : null;
      sortable.destroy();
      ghost?.remove();
      clone?.remove();
    },
  };
}
