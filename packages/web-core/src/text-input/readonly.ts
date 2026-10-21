/** Whether the keystroke modifies an input, including paste/cut shortcuts. */
export const isReadonlyModificationKey = (e: KeyboardEvent): boolean => {
  const { key, ctrlKey, metaKey, altKey } = e;
  // 粘贴 / 剪切属于修改意图
  if ((ctrlKey || metaKey) && (key === 'v' || key === 'V' || key === 'x' || key === 'X')) {
    return true;
  }
  // 其余 Ctrl / Meta / Alt 组合（复制、全选等）在只读下允许，不提示
  if (ctrlKey || metaKey || altKey) {
    return false;
  }
  // 可见字符或退格 / 删除
  return key.length === 1 || key === 'Backspace' || key === 'Delete';
};

export interface UseReadonlyTipOptions {
  /**
   * @zh 自动隐藏时长（毫秒）
   * @en Auto-hide duration (ms)
   * @defaultValue 2000
   */
  duration?: number;
}

export function createReadonlyTip(adapter: {
  readonly readonly: boolean | string | undefined;
  readonly disabled: boolean;
  readonly duration?: number;
  setVisible(value: boolean): void;
}) {
  const duration = adapter.duration ?? 2000;
  let timer: ReturnType<typeof setTimeout> | null = null;
  return {
    hide() {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      adapter.setVisible(false);
    },
    show() {
      if (!adapter.readonly || adapter.disabled) return;
      if (timer) clearTimeout(timer);
      adapter.setVisible(true);
      timer = setTimeout(() => {
        adapter.setVisible(false);
        timer = null;
      }, duration);
    },
  };
}
