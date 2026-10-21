import type { ModelSelectorItemData } from './types.js';
export interface ModelSelectorItemState {
  readonly props: {
    readonly label: string;
    readonly value: string;
    readonly keywords: string[];
    readonly disabled: boolean;
    readonly shortcut: string;
  };
  readonly element: HTMLElement | null;
  readonly renderedLabel: string;
  readonly groupId: symbol | undefined;
  readonly id: symbol;
  readonly domId: string;
  domTextVersion: number;
}
export function createModelSelectorItemFoundation(
  state: ModelSelectorItemState,
  callbacks: {
    select(value: string, event: Event): void;
    selectItem(item: ModelSelectorItemData, event: Event): void;
  },
) {
  let labelObserver: MutationObserver | undefined;
  function getRenderedLabel() {
    void state.domTextVersion;
    return state.props.label || state.element?.textContent?.trim() || state.props.value;
  }
  function updateRenderedLabel() {
    const nextLabel = state.props.label || state.element?.textContent?.trim() || state.props.value;
    if (nextLabel !== state.renderedLabel) {
      state.domTextVersion += 1;
    }
  }
  function startLabelObserver() {
    if (state.element && typeof MutationObserver === 'function') {
      labelObserver = new MutationObserver(updateRenderedLabel);
      labelObserver.observe(state.element, {
        childList: true,
        characterData: true,
        subtree: true,
      });
    }
  }

  function stopLabelObserver() {
    labelObserver?.disconnect();
    labelObserver = undefined;
  }

  function getItemData(): ModelSelectorItemData {
    return {
      disabled: state.props.disabled,
      domId: state.domId,
      element: state.element ?? undefined,
      groupId: state.groupId,
      id: state.id,
      keywords: state.props.keywords,
      label: state.renderedLabel,
      select: handleSelect,
      shortcut: state.props.shortcut.trim() || undefined,
      value: state.props.value,
    };
  }

  function handleSelect(event: Event) {
    if (state.props.disabled) {
      return;
    }

    callbacks.select(state.props.value, event);
    callbacks.selectItem(getItemData(), event);
  }

  return {
    getRenderedLabel,
    updateRenderedLabel,
    startLabelObserver,
    stopLabelObserver,
    getItemData,
    handleSelect,
  };
}
