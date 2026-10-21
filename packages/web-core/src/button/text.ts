export interface ButtonTextState {
  readonly autoInsertSpace: boolean;
  isTwoCNChar: boolean;
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
