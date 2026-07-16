import { computed, onBeforeUnmount, ref, Ref } from 'vue';

import { useI18n } from '../locale';

const DEFAULT_DURATION = 2000;

/**
 * @zh 判断按键是否会修改输入框的值，用于在只读状态下提示用户
 * @en Whether the keystroke would modify the input value, used to prompt the user in readonly state
 * @param e
 */
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

/**
 * @zh 只读模式提示。在用户尝试修改只读组件时短暂显示 tooltip，每次新的修改尝试都会重置隐藏计时器。
 * @en Readonly tip. Briefly shows a tooltip when the user attempts to modify a readonly component;
 * each new attempt resets the hide timer.
 * @param readonly
 * @param disabled
 * @param options
 */
export const useReadonlyTip = (
  readonly: Ref<boolean | string | undefined>,
  disabled: Ref<boolean>,
  options?: UseReadonlyTipOptions,
) => {
  const duration = options?.duration ?? DEFAULT_DURATION;
  const tipVisible = ref(false);
  let timer: ReturnType<typeof setTimeout> | null = null;

  const hide = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    tipVisible.value = false;
  };

  const show = () => {
    if (!readonly.value || disabled.value) {
      return;
    }
    // 每次调用都重置隐藏计时器
    if (timer) {
      clearTimeout(timer);
    }
    tipVisible.value = true;
    timer = setTimeout(() => {
      tipVisible.value = false;
      timer = null;
    }, duration);
  };

  onBeforeUnmount(hide);

  return {
    tipVisible,
    show,
    hide,
  };
};

/**
 * @zh 获取只读提示文案：readonly 为字符串时直接使用该字符串，否则取自 i18n 的 `readonlyTip`（缺失时回退英文）
 * @en Returns the readonly tip text: if `readonly` is a string, use it directly;
 * otherwise fall back to i18n `readonlyTip` (English when missing).
 */
export const useReadonlyTipText = (readonly: Ref<boolean | string | undefined>) => {
  const { t } = useI18n();
  return computed(() => {
    if (typeof readonly.value === 'string') {
      return readonly.value;
    }
    const text = t('readonlyTip');
    return text === 'readonlyTip' ? 'Read-only mode' : text;
  });
};
