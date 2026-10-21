export function createNoticeTimer(adapter: {
  readonly duration: number;
  readonly resetOnUpdate: boolean;
  readonly resetOnHover: boolean;
  schedule(callback: () => void, duration: number): number;
  cancel(handle: number): void;
  onClose(): void;
}) {
  let timer = 0;
  let hovered = false;
  function close() {
    adapter.onClose();
  }
  function start() {
    if (adapter.duration > 0 && !(adapter.resetOnHover && hovered))
      timer = adapter.schedule(close, adapter.duration);
  }
  function clear() {
    if (timer) {
      adapter.cancel(timer);
      timer = 0;
    }
  }
  function restart() {
    clear();
    start();
  }
  function updated() {
    if (adapter.resetOnUpdate) restart();
  }
  function enter() {
    hovered = true;
    if (adapter.resetOnHover) clear();
  }
  function leave() {
    hovered = false;
    if (adapter.resetOnHover) start();
  }
  return { close, start, clear, restart, updated, enter, leave };
}
