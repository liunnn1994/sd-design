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

export function observeButtonIconSpacing(
  icon: HTMLElement,
  contentClass: string,
  ellipsisContentClass: string,
) {
  const button = icon.parentElement!;
  const update = () => {
    const content = icon.nextElementSibling;
    if (!content?.classList.contains(contentClass)) {
      icon.removeAttribute('data-empty-button-content');
      return;
    }

    // Active single-line ellipsis wraps the label separately from its measurement node.
    const firstChild = content.firstElementChild;
    const label =
      content.getAttribute('data-part') === 'root' &&
      firstChild?.classList.contains(ellipsisContentClass)
        ? firstChild
        : content;
    const hasContent = Array.from(label.childNodes).some((node) =>
      node.nodeType === Node.ELEMENT_NODE
        ? !(node as Element).hasAttribute('data-ellipsis-measure')
        : node.nodeType === Node.TEXT_NODE && !!node.nodeValue?.trim(),
    );
    icon.toggleAttribute('data-empty-button-content', !hasContent);
  };

  update();
  const observer = new MutationObserver(update);
  observer.observe(button, { childList: true, characterData: true, subtree: true });
  return () => {
    observer.disconnect();
    icon.removeAttribute('data-empty-button-content');
  };
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
