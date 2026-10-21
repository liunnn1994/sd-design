import { isUndefined } from './is.js';

export function getItemParent(item: HTMLElement | undefined, className: string | undefined) {
  let parent = item?.parentElement ?? undefined;
  if (className) {
    while (parent && !parent.classList.contains(className))
      parent = parent.parentElement ?? undefined;
  }
  return parent;
}

export function createItemIndex(adapter: {
  readonly item: HTMLElement | undefined;
  readonly selector: string;
  readonly explicit: number | undefined;
  readonly parentClassName: string | undefined;
  readonly value: number;
  parent: HTMLElement | undefined;
  setValue(value: number): void;
}) {
  function update() {
    if (isUndefined(adapter.explicit) && adapter.parent && adapter.item) {
      const items = Array.from(adapter.parent.querySelectorAll(adapter.selector)).filter(
        (item) =>
          !adapter.parentClassName ||
          item.closest(`.${adapter.parentClassName}`) === adapter.parent,
      );
      const index = items.indexOf(adapter.item);
      if (index !== adapter.value) adapter.setValue(index);
    }
  }
  return {
    update,
    syncItem() {
      if (adapter.item && !adapter.parent)
        adapter.parent = getItemParent(adapter.item, adapter.parentClassName);
    },
    observe(element: HTMLElement | undefined) {
      if (!element) return undefined;
      const observer = new MutationObserver(update);
      observer.observe(element, { childList: true, subtree: true });
      return () => observer.disconnect();
    },
    mount() {
      if (adapter.item) adapter.parent = getItemParent(adapter.item, adapter.parentClassName);
      update();
    },
    updated() {
      adapter.parent = getItemParent(adapter.item, adapter.parentClassName);
      update();
    },
  };
}
