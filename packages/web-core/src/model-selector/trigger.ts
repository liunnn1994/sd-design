export interface ModelSelectorTriggerState {
  readonly disabled: boolean;
}

export interface ModelSelectorTriggerContext {
  readonly visible: { readonly value: boolean };
  setVisible(visible: boolean): void;
}

export function createModelSelectorTriggerFoundation(
  state: ModelSelectorTriggerState,
  context: ModelSelectorTriggerContext,
) {
  function handleClick(event: MouseEvent) {
    if (state.disabled) {
      event.preventDefault();
      return;
    }

    context.setVisible(!context.visible.value);
  }
  return { handleClick };
}
