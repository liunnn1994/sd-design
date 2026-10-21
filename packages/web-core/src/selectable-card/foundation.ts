export interface SelectableCardState {
  readonly disabled: boolean;
  readonly selected: boolean;
}

export function toCssSize(value: number | string | undefined, spacing = false) {
  if (value === undefined) return undefined;
  return typeof value === 'number' ? `${spacing ? value * 4 : value}px` : value;
}

export function createSelectableCardFoundation(
  state: SelectableCardState,
  onChange: (selected: boolean) => void,
) {
  function toggle() {
    if (!state.disabled) onChange(!state.selected);
  }

  function handleCardClick(event: MouseEvent) {
    if (state.disabled) return;

    const target = event.target as HTMLElement;
    if (target.closest('a, button, input, label, select, textarea, [role="button"]')) return;

    toggle();
  }

  function handleInputChange(event: Event) {
    toggle();
    (event.target as HTMLInputElement).checked = state.selected;
  }
  return { handleCardClick, handleInputChange };
}
