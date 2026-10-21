import type { UseReadonlyTipOptions } from '@sdata/web-core/text-input/readonly';

import { computed, onBeforeUnmount, ref, Ref } from 'vue';

import { createReadonlyTip } from '@sdata/web-core/text-input/readonly';

import { useI18n } from '../locale';
export { isReadonlyModificationKey } from '@sdata/web-core/text-input/readonly';
export type { UseReadonlyTipOptions } from '@sdata/web-core/text-input/readonly';

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
  const tipVisible = ref(false);
  const { show, hide } = createReadonlyTip({
    get readonly() {
      return readonly.value;
    },
    get disabled() {
      return disabled.value;
    },
    duration: options?.duration,
    setVisible(value) {
      tipVisible.value = value;
    },
  });

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
