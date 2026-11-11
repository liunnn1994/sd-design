// Match the Vue adapter's useMagicKeys tracking, including missed keyup events under modifiers.
export function createModelSelectorKeyTracker() {
  const current = new Set<string>();
  const dependencies = new Map(['Meta', 'Shift', 'Alt'].map((name) => [name, new Set<string>()]));
  function update(event: KeyboardEvent) {
    const key = event.key.toLowerCase();
    if (!key) return;
    const pressed = event.type === 'keydown';
    if (pressed) current.add(key);
    else current.delete(key);
    if (pressed && typeof event.getModifierState === 'function') {
      for (const [name, keys] of dependencies) {
        if (event.getModifierState(name)) {
          for (const value of [...current, event.code.toLowerCase(), key])
            if (value) keys.add(value);
          break;
        }
      }
    }
    if (!pressed && ['shift', 'alt'].includes(key)) {
      const keys = dependencies.get(key.charAt(0).toUpperCase() + key.slice(1))!;
      const values = [...keys];
      const index = values.indexOf(key);
      values.forEach((value, position) => {
        if (position >= index) current.delete(value);
      });
      keys.clear();
    }
    if (!pressed && key === 'meta') {
      const keys = dependencies.get('Meta')!;
      keys.forEach((value) => current.delete(value));
      keys.clear();
    }
  }
  return { current, update, clear: () => current.clear() };
}
