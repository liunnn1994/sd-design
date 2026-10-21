export interface ModelSelectorInputState {
  readonly modelValue: string | undefined;
  query: string;
  readonly inputAttrs: Record<string, unknown> | undefined;
  readonly listId: string;
  readonly visible: boolean;
  readonly activeDescendant: string | undefined;
}
export function createModelSelectorInputFoundation(
  state: ModelSelectorInputState,
  callbacks: {
    update(value: string): void;
    moveActive(offset: number): void;
    selectActive(event: Event): void;
    setVisible(value: boolean): void;
  },
) {
  function getMergedValue() {
    return state.modelValue ?? state.query;
  }
  function getInputAttrs() {
    return {
      ...state.inputAttrs,
      'type': 'search',
      'role': 'combobox',
      'autocomplete': 'off',
      'aria-controls': state.listId,
      'aria-expanded': state.visible,
      'aria-activedescendant': state.activeDescendant,
    };
  }
  function syncModelValue(value: string | undefined) {
    if (value !== undefined) state.query = value;
  }
  function handleInput(value: string) {
    state.query = value;
    callbacks.update(value);
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.isComposing) {
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      callbacks.moveActive(1);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      callbacks.moveActive(-1);
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      callbacks.selectActive(event);
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      callbacks.setVisible(false);
    }
  }
  return { getMergedValue, getInputAttrs, syncModelValue, handleInput, handleKeydown };
}
