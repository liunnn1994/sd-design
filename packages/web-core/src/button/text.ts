export interface ButtonTextState {
  readonly autoInsertSpace: boolean;
  isTwoCNChar: boolean;
}

export function getButtonText(element: HTMLElement | null | undefined): string {
  if (!element) return '';
  const walker = element.ownerDocument.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) =>
      node.parentElement?.closest('[data-ellipsis-measure]')
        ? NodeFilter.FILTER_REJECT
        : NodeFilter.FILTER_ACCEPT,
  });
  let text = '';
  while (walker.nextNode()) text += walker.currentNode.textContent;
  return text;
}

export function createButtonTextFoundation(
  state: ButtonTextState,
  getText: () => string | null | undefined,
) {
  const regexTwoCNChar = /^[一-龥]{2}$/;
  const updateIsTwoCNChar = () => {
    if (!state.autoInsertSpace) {
      if (state.isTwoCNChar) {
        state.isTwoCNChar = false;
      }
      return;
    }

    const textContent = getText()?.replace(/\s/g, '') ?? '';
    const value = regexTwoCNChar.test(textContent);

    if (value !== state.isTwoCNChar) {
      state.isTwoCNChar = value;
    }
  };

  return { updateIsTwoCNChar };
}
