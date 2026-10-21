export type DropdownValue = string | number | Record<string, unknown> | undefined;
export interface DropdownState {
  readonly hideOnSelect: boolean;
}
export interface DropdownOptionContext {
  onOptionClick(value: DropdownValue, event: Event): void;
}
export interface DropdownOptionState {
  readonly disabled: boolean;
  readonly value: DropdownValue;
  readonly context: DropdownOptionContext | undefined;
}
export function createDropdownFoundation(
  state: DropdownState,
  onSelect: (value: DropdownValue, event: Event) => void,
  onVisibleChange: (visible: boolean) => void,
) {
  const handleOptionClick = (value: DropdownValue, ev: Event) => {
    onSelect(value, ev);
    if (state.hideOnSelect) onVisibleChange(false);
  };
  return { handleOptionClick };
}
export function createDropdownOptionFoundation(
  state: DropdownOptionState,
  getText: () => string | null | undefined,
  onClick: (event: MouseEvent) => void,
) {
  const handleClick = (ev: MouseEvent) => {
    if (!state.disabled) {
      onClick(ev);
      state.context?.onOptionClick(state.value ?? getText() ?? undefined, ev);
    }
  };
  return { handleClick };
}
