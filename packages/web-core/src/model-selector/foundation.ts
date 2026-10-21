import type { ModelSelectorItemData } from './types.js';

import { isShortcutPressed } from './shortcut.js';
export function getModelSelectorVisible(
  hasVisibleProp: boolean,
  visibleModel: boolean | undefined,
  innerVisible: boolean,
) {
  return hasVisibleProp ? Boolean(visibleModel) : innerVisible;
}
export function updateModelSelectorVisible(
  state: { innerVisible: boolean; visibleModel: boolean | undefined },
  value: boolean | undefined,
) {
  const nextVisible = Boolean(value);
  state.innerVisible = nextVisible;
  state.visibleModel = nextVisible;
}
export interface ModelSelectorFoundationState {
  readonly props: { readonly closeOnSelect: boolean; readonly resetQueryOnClose: boolean };
  innerVisible: boolean;
  visibleModel: boolean | undefined;
  query: string;
  activeId: symbol | undefined;
  itemsVersion: number;
  readonly mergedVisible: boolean;
  readonly normalizedQuery: string;
  readonly visibleItems: ModelSelectorItemData[];
  readonly navigableItems: ModelSelectorItemData[];
}
export function createModelSelectorFoundation(
  state: ModelSelectorFoundationState,
  callbacks: {
    readonly keyAliases: Readonly<Record<string, string>>;
    readonly currentKeys: ReadonlySet<string>;
    visibleChange(value: boolean): void;
    select(value: string, event: Event): void;
  },
) {
  const items = new Map<symbol, ModelSelectorItemData>();
  const groups = new Map<symbol, { readonly value: boolean }>();
  function getNormalizedQuery() {
    return state.query.trim().toLocaleLowerCase();
  }
  function getNavigableItems() {
    return state.visibleItems.filter(
      (item) => !item.groupId || groups.get(item.groupId)?.value !== false,
    );
  }
  function getActiveDescendant() {
    return state.activeId ? items.get(state.activeId)?.domId : undefined;
  }
  function isItemVisible(item: ModelSelectorItemData) {
    const search = state.normalizedQuery;
    if (!search) {
      return true;
    }

    return [item.value, item.label, ...item.keywords].some((text) =>
      text.toLocaleLowerCase().includes(search),
    );
  }

  function getVisibleItems(groupId?: symbol) {
    void state.itemsVersion;
    return [...items.values()].filter(
      (item) => (groupId === undefined || item.groupId === groupId) && isItemVisible(item),
    );
  }

  function setVisible(value: boolean) {
    if (state.mergedVisible === value) {
      return;
    }

    state.innerVisible = value;
    state.visibleModel = value;
    callbacks.visibleChange(value);
  }

  function registerItem(item: ModelSelectorItemData) {
    items.set(item.id, item);
    state.itemsVersion += 1;
  }

  function registerGroup(id: symbol, expanded: { readonly value: boolean }) {
    groups.set(id, expanded);
  }

  function unregisterGroup(id: symbol) {
    groups.delete(id);
  }

  function updateItem(item: ModelSelectorItemData) {
    items.set(item.id, item);
    state.itemsVersion += 1;
  }

  function unregisterItem(id: symbol) {
    items.delete(id);
    if (state.activeId === id) {
      state.activeId = undefined;
    }
    state.itemsVersion += 1;
  }

  function setActive(id?: symbol) {
    state.activeId = id;
  }

  function moveActive(offset: number) {
    const enabledItems = state.navigableItems
      .filter((item) => !item.disabled)
      .sort((a, b) => {
        if (!a.element || !b.element) {
          return 0;
        }
        const position = a.element.compareDocumentPosition(b.element);
        if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
          return -1;
        }
        if (position & Node.DOCUMENT_POSITION_PRECEDING) {
          return 1;
        }
        return 0;
      });
    if (!enabledItems.length) {
      state.activeId = undefined;
      return;
    }

    const currentIndex = enabledItems.findIndex((item) => item.id === state.activeId);
    const nextIndex =
      currentIndex === -1
        ? offset > 0
          ? 0
          : enabledItems.length - 1
        : (currentIndex + offset + enabledItems.length) % enabledItems.length;
    const nextItem = enabledItems[nextIndex];
    state.activeId = nextItem.id;
    nextItem.element?.scrollIntoView({ block: 'nearest' });
  }

  function selectItem(item: ModelSelectorItemData, event: Event) {
    if (item.disabled) {
      return;
    }

    callbacks.select(item.value, event);
    if (state.props.closeOnSelect) {
      setVisible(false);
    }
  }

  function selectActive(event: Event) {
    if (!state.activeId) {
      return;
    }

    const item = state.navigableItems.find((item) => item.id === state.activeId);
    if (item) {
      item.select(event);
    }
  }

  function handleShortcut(event: KeyboardEvent) {
    if (event.type !== 'keydown' || event.repeat || !state.mergedVisible) {
      return;
    }

    const item = state.navigableItems.find(
      ({ disabled, shortcut }) =>
        !disabled &&
        shortcut &&
        isShortcutPressed(shortcut, event, callbacks.currentKeys, callbacks.keyAliases),
    );
    if (!item) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    item.select(event);
  }
  function syncQuery() {
    state.activeId = state.navigableItems.find((item) => !item.disabled)?.id;
  }

  function syncNavigableItems(availableItems: ModelSelectorItemData[]) {
    if (state.activeId && !availableItems.some((item) => item.id === state.activeId)) {
      state.activeId = availableItems.find((item) => !item.disabled)?.id;
    }
  }

  function syncVisible(visible: boolean) {
    if (!visible && state.props.resetQueryOnClose) {
      state.query = '';
      state.activeId = undefined;
    }
  }

  return {
    isItemVisible,
    getVisibleItems,
    setVisible,
    registerItem,
    registerGroup,
    unregisterGroup,
    updateItem,
    unregisterItem,
    setActive,
    moveActive,
    selectItem,
    selectActive,
    syncQuery,
    syncNavigableItems,
    syncVisible,
    getNormalizedQuery,
    getNavigableItems,
    getActiveDescendant,
    handleShortcut,
  };
}
