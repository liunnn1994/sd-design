import { sanitizeImageSrc } from 'stream-markdown-parser';

export interface MarkdownImageState {
  fallback: boolean;
  loaded: boolean;
  failed: boolean;
  readonly nodeSrc: string;
  readonly fallbackSrc: string;
  readonly indexKey: string | number;
  readonly src: string;
  readonly root: { readonly offsetHeight: number } | null;
}

export interface MarkdownImageLifecycle {
  markPending(key: string | number): void;
  markSettled(key: string | number): void;
  reportHeight(key: string | number, height: number): void;
}

export function createMarkdownImageFoundation(
  state: MarkdownImageState,
  lifecycle: MarkdownImageLifecycle | undefined,
  nextTick: () => Promise<unknown>,
  onLoad: (src: string) => void,
  onError: (src: string) => void,
  onClick: (payload: [MouseEvent, string]) => void,
) {
  const getSrc = () =>
    sanitizeImageSrc(state.fallback ? state.fallbackSrc : state.nodeSrc) ||
    sanitizeImageSrc(state.fallbackSrc) ||
    '';
  let pending: { key: string | number } | undefined;
  const settlePending = (request = pending) => {
    if (!request || request !== pending) return;
    pending = undefined;
    lifecycle?.markSettled(request.key);
  };
  const reset = (onCleanup: (cleanup: () => void) => void) => {
    state.fallback = false;
    state.loaded = false;
    state.failed = !state.src;
    if (state.src) {
      const request = { key: state.indexKey };
      pending = request;
      lifecycle?.markPending(request.key);
      onCleanup(() => settlePending(request));
    }
  };
  const settle = async () => {
    const request = pending;
    await nextTick();
    if (!request || request !== pending) return;
    if (state.root) lifecycle?.reportHeight(request.key, state.root.offsetHeight);
    settlePending(request);
  };
  function handleLoad() {
    state.loaded = true;
    onLoad(state.src);
    void settle();
  }
  function handleError() {
    if (!state.fallback && sanitizeImageSrc(state.fallbackSrc) && state.fallbackSrc !== state.src) {
      state.fallback = true;
      return;
    }
    state.failed = true;
    onError(state.src);
    void settle();
  }
  function handleClick(event: MouseEvent) {
    if (state.loaded) onClick([event, state.src]);
  }
  return { getSrc, reset, settle, settlePending, handleLoad, handleError, handleClick };
}
