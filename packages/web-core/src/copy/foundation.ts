import type { ClipboardOptions } from '../clipboard.js';
export function getCopyDisabled(disabled: unknown) {
  return disabled === '' || disabled === true || disabled === 'true';
}
export interface CopyFoundationState {
  readonly props: {
    readonly content: string;
    readonly clipboardProps: ClipboardOptions | undefined;
  };
  readonly isDisabled: boolean;
  copied: boolean;
}
export function createCopyFoundation(
  state: CopyFoundationState,
  callbacks: {
    copy(text: string, options: ClipboardOptions | undefined): Promise<boolean>;
    success(): void;
    copied(text: string): void;
  },
) {
  let feedbackTimer: ReturnType<typeof setTimeout> | undefined;
  let disposed = false;
  async function handleCopy() {
    if (state.isDisabled || !state.props.content) {
      return;
    }

    // copy-to-clipboard 在所有 fallback（clipboard API → execCommand → prompt）
    // 都失败时 resolve false：这里把失败抛出来，而不是静默提示"复制成功"
    const content = state.props.content;
    const success = await callbacks.copy(content, state.props.clipboardProps);
    if (disposed) return;
    if (!success) {
      throw new Error('[sdCopy] failed to copy content to the clipboard');
    }
    callbacks.success();
    state.copied = true;
    clearTimeout(feedbackTimer);
    feedbackTimer = setTimeout(() => {
      state.copied = false;
    }, 2500);
    callbacks.copied(content);
  }

  function dispose() {
    disposed = true;
    clearTimeout(feedbackTimer);
  }
  return { handleCopy, dispose };
}
