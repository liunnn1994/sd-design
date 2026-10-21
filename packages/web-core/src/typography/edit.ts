export function createTypographyEditFoundation(
  state: { readonly rootElement: HTMLElement | undefined },
  callbacks: { update(text: string): void; change(text: string): void; end(): void },
) {
  function onChange(value: string) {
    callbacks.update(value);
    callbacks.change(value);
  }

  function onEnd() {
    callbacks.end();
  }

  function onEnter(event: KeyboardEvent) {
    if (!event.isComposing) onEnd();
  }

  function focusInput() {
    // SdInput 的 $el 非普通元素（条件根节点），不能直接 querySelector；改从包裹 div 取 input
    const inputEl = state.rootElement?.querySelector('input');
    if (!inputEl) return;

    inputEl.focus();

    const { length } = inputEl.value;
    inputEl.setSelectionRange(length, length);
  }

  return { onChange, onEnd, onEnter, focusInput };
}
