<template>
  <Tooltip v-bind="mergedTooltipProps">
    <component
      :is="renderComponent"
      v-bind="attrs"
      :disabled="isDisabled"
      :class="componentClass"
      :aria-label="computedAriaLabel"
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
  import { computed, onBeforeUnmount, useAttrs, useSlots } from 'vue';

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
  const { t } = useI18n();
  const prefixCls = getPrefixCls('copy');
  // 图标态（无默认插槽文案）时复用 tooltip 文案做无障碍名，避免 SR 只读到无名的图标按钮；
  // 消费者显式 aria-label 或有可见文案时优先之。
  const computedAriaLabel = computed(() => {
    const consumer = attrs['aria-label'];
    if (consumer !== undefined) return consumer as string;
    if (slots.default) return undefined;
    return mergedTooltip.value;
  });
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
