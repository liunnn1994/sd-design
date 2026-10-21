// Refer to Element Plus
export interface CursorSelection {
  selectionStart: number;
  beforeTxt: string;
  afterTxt: string;
}
export function createCursorFoundation(state: {
  readonly input: HTMLInputElement | HTMLTextAreaElement | undefined;
  selection: CursorSelection | undefined;
}) {
  function recordCursor() {
    if (!state.input) return;

    const { selectionStart, selectionEnd, value } = state.input;

    if (selectionStart == null || selectionEnd == null) return;

    const beforeTxt = value.slice(0, Math.max(0, selectionStart));
    const afterTxt = value.slice(Math.max(0, selectionEnd));

    state.selection = { selectionStart, beforeTxt, afterTxt };
  }

  function setCursor() {
    if (!state.input || !state.selection) return;

    const { value } = state.input;
    const { beforeTxt, afterTxt, selectionStart } = state.selection;

    let startPos = value.length;

    if (value.endsWith(afterTxt)) {
      // get from after
      startPos = value.length - afterTxt.length;
    } else if (value.startsWith(beforeTxt)) {
      // get from before
      startPos = beforeTxt.length;
    } else {
      const beforeLastChar = beforeTxt[selectionStart - 1];
      const newIndex = value.indexOf(beforeLastChar, selectionStart - 1);
      if (newIndex !== -1) {
        startPos = newIndex + 1;
      }
    }

    state.input.setSelectionRange(startPos, startPos);
  }

  return { recordCursor, setCursor };
}
