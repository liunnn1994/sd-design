// 通用小工具：事件总线和空函数。clamp 使用 es-toolkit（见 panel.ts）。
export const noop = () => {
  //
};

export interface Emitter {
  clear: () => void;
  emit: () => void;
  subscribe: (listener: () => void) => () => void;
}

export const emitter = () => {
  const listeners = new Set<() => void>();

  return {
    clear: () => listeners.clear(),
    emit: () => {
      // 快照后遍历：监听器可能在通知过程中取消订阅
      // oxlint-disable-next-line unicorn/no-useless-spread -- 通知期间新增的订阅留到下一轮
      for (const listener of [...listeners]) {
        listener();
      }
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
  };
};
