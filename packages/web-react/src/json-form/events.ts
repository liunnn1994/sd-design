export function mergeJsonFormEvents(
  props: object | undefined,
  events: Record<string, unknown> | undefined,
  modelEvent = 'onValueChange',
) {
  const merged: Record<string, unknown> = { ...props };
  for (const [name, handler] of Object.entries(events ?? {})) {
    const update = [
      'update:modelValue',
      'update:value',
      'onUpdate:modelValue',
      'onUpdate:value',
    ].includes(name);
    const key = update
      ? modelEvent
      : /^on[A-Z]/.test(name)
        ? name
        : `on${name.charAt(0).toUpperCase()}${name.slice(1)}`;
    const original = merged[key];
    merged[key] =
      typeof original === 'function' && typeof handler === 'function' && original !== handler
        ? (...args: unknown[]) => {
            original(...args);
            handler(...args);
          }
        : handler;
  }
  return merged;
}
