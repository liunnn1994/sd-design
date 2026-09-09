import { getThemeCSSVariables, type SDThemeNormalized, type SdThemeMode } from './theme';

interface GlobalThemeLayer {
  variables: Record<string, string>;
  mode?: SdThemeMode;
}

interface GlobalThemeTarget {
  mode: string | null;
  variables: Map<string, { value: string; priority: string }>;
  layers: Map<symbol, GlobalThemeLayer>;
}

const targets = new WeakMap<HTMLElement, GlobalThemeTarget>();

function render(target: HTMLElement, state: GlobalThemeTarget) {
  const variables: Record<string, string> = {};
  let mode = state.mode;
  for (const layer of state.layers.values()) {
    Object.assign(variables, layer.variables);
    if (layer.mode !== undefined) mode = layer.mode;
  }
  for (const [key, original] of state.variables) {
    if (variables[key] !== undefined) {
      target.style.setProperty(key, variables[key]);
    } else {
      if (original.value) target.style.setProperty(key, original.value, original.priority);
      else target.style.removeProperty(key);
      state.variables.delete(key);
    }
  }
  if (mode === null) target.removeAttribute('sd-theme');
  else target.setAttribute('sd-theme', mode);
}

export function applyGlobalTheme(
  target: HTMLElement,
  owner: symbol,
  theme: SDThemeNormalized,
  mode?: SdThemeMode,
) {
  let state = targets.get(target);
  if (!state) {
    state = { mode: target.getAttribute('sd-theme'), variables: new Map(), layers: new Map() };
    targets.set(target, state);
  }
  const variables = getThemeCSSVariables(theme);
  for (const key of Object.keys(variables)) {
    if (!state.variables.has(key)) {
      state.variables.set(key, {
        value: target.style.getPropertyValue(key),
        priority: target.style.getPropertyPriority(key),
      });
    }
  }
  // Updating an existing owner preserves its position below providers mounted later.
  state.layers.set(owner, { variables, mode });
  render(target, state);
}

export function releaseGlobalTheme(target: HTMLElement, owner: symbol) {
  const state = targets.get(target);
  if (!state) return;
  state.layers.delete(owner);
  render(target, state);
  if (!state.layers.size) targets.delete(target);
}
