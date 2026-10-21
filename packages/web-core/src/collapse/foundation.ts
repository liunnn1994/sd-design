import { isArray, isNumber } from '../_utils/is.js';
import { isActivationKey } from '../_utils/keyboard.js';
export type CollapseKey = string | number;
export type CollapseValue = CollapseKey | CollapseKey[];
export function createCollapseFoundation(adapter: {
  readonly value: CollapseValue | undefined;
  readonly inner: CollapseValue;
  readonly keys: CollapseKey[];
  readonly accordion: boolean;
  setInner(value: CollapseKey[]): void;
  onChange(value: CollapseKey[], event: Event): void;
}) {
  function getKeys() {
    const value = adapter.value ?? adapter.inner;
    return isArray(value) ? value : [value];
  }
  function click(key: CollapseKey, event: Event) {
    let keys: CollapseKey[] = [];
    if (adapter.accordion) {
      if (!adapter.keys.includes(key)) keys = [key];
      adapter.setInner(keys);
    } else {
      keys = [...adapter.keys];
      const index = keys.indexOf(key);
      if (index > -1) keys.splice(index, 1);
      else keys.push(key);
      adapter.setInner(keys);
    }
    adapter.onChange(keys, event);
  }
  return { getKeys, click };
}
export function normalizeCollapseKey(key: unknown): CollapseKey {
  return isNumber(key) ? key : String(key ?? '');
}
export function createCollapseItemFoundation(adapter: {
  readonly disabled: boolean;
  readonly active: boolean | undefined;
  readonly destroy: boolean | undefined;
  readonly mounted: boolean | undefined;
  setMounted(value: boolean): void;
  onClick(event: Event): void;
  isInteractiveTarget(event: KeyboardEvent): boolean;
}) {
  let leaving = false;
  function click(event: MouseEvent) {
    if (!adapter.disabled) adapter.onClick(event);
  }
  function keydown(event: KeyboardEvent) {
    if (adapter.disabled || adapter.isInteractiveTarget(event)) return;
    if (isActivationKey(event)) {
      event.preventDefault();
      adapter.onClick(event);
    }
  }
  function beforeLeave() {
    leaving = true;
  }
  function afterLeave() {
    leaving = false;
    if (adapter.destroy) adapter.setMounted(false);
  }
  function leaveCancelled() {
    leaving = false;
  }
  function syncDestroy(destroy: boolean | undefined) {
    if (!destroy) adapter.setMounted(true);
    else if (!adapter.active && !leaving) adapter.setMounted(false);
  }
  function syncActive(active: boolean | undefined) {
    if (active && !adapter.mounted) adapter.setMounted(true);
  }
  return { click, keydown, beforeLeave, afterLeave, leaveCancelled, syncDestroy, syncActive };
}
