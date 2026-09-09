<template>
  <Tooltip v-bind="mergedTooltipProps">
    <component
      :is="renderComponent"
      v-bind="attrs"
      :disabled="isDisabled"
      :class="componentClass"
      :aria-label="
        (attrs['aria-label'] as string | undefined) ?? (hasTextSlot ? undefined : mergedTooltip)
      "
      @click="handleCopy"
    >
      <template #icon>
        <slot name="icon">
          <IconCopy />
        </slot>
      </template>
      <slot />
    </component>
  </Tooltip>
</template>

<script setup lang="ts">
  import { computed, onBeforeUnmount, onBeforeUpdate, shallowRef, useAttrs, useSlots } from 'vue';

  import copy from 'copy-to-clipboard';

  import type { CopyComponentType, CopyProps } from './types';

  import { getPrefixCls } from '../_utils/global-config';
  import Button from '../button';
  import IconCopy from '../icon/icon-copy';
  import Link from '../link';
  import { useI18n } from '../locale';
  import Message from '../message';
  import Tooltip from '../tooltip';

  defineOptions({
    name: 'Copy',
    inheritAttrs: false,
  });

  const props = withDefaults(defineProps<CopyProps>(), {
    content: '',
    tooltip: undefined,
    tooltipProps: undefined,
    clipboardProps: undefined,
    component: 'link',
    textInherit: true,
    successMessage: undefined,
  });

  const emit = defineEmits<{
    /**
     * @zh 复制成功后触发
     * @en Emitted after content is copied
     */
    copy: [value: string];
  }>();

  const attrs = useAttrs();
  const slots = useSlots();
  const hasTextSlot = shallowRef(Boolean(slots.default));
  onBeforeUpdate(() => {
    hasTextSlot.value = Boolean(slots.default);
  });
  const { t } = useI18n();
  const prefixCls = getPrefixCls('copy');
  const componentMap: Record<CopyComponentType, typeof Link | typeof Button> = {
    link: Link,
    button: Button,
  };

  const renderComponent = computed(() => componentMap[props.component]);
  const componentClass = computed(() => [
    prefixCls,
    { [`${prefixCls}-inherit`]: props.component === 'link' && props.textInherit },
  ]);
  const isDisabled = computed(() => {
    const disabled =
      (props as CopyProps & { disabled?: boolean | string }).disabled ?? attrs.disabled;

    return disabled === '' || disabled === true || disabled === 'true';
  });
  // 默认 tooltip/successMessage 走 locale，消费方显式传入时优先
  const mergedTooltip = computed(() => props.tooltip ?? t('copy.copy'));
  const mergedSuccessMessage = computed(() => props.successMessage ?? t('copy.copied'));
  const mergedTooltipProps = computed(() => ({
    ...props.tooltipProps,
    content: props.tooltipProps?.content ?? mergedTooltip.value,
  }));

  let disposed = false;
  onBeforeUnmount(() => {
    disposed = true;
  });

  async function handleCopy() {
    if (isDisabled.value || !props.content) {
      return;
    }

    // copy-to-clipboard 在所有 fallback（clipboard API → execCommand → prompt）
    // 都失败时 resolve false：这里把失败抛出来，而不是静默提示"复制成功"
    const content = props.content;
    const success = await copy(content, props.clipboardProps);
    if (disposed) return;
    if (!success) {
      throw new Error('[sdCopy] failed to copy content to the clipboard');
    }
    Message.success(mergedSuccessMessage.value);
    emit('copy', content);
  }
</script>
