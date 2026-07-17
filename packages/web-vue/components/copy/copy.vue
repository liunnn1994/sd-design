<template>
  <Tooltip v-bind="mergedTooltipProps">
    <component
      :is="renderComponent"
      v-bind="attrs"
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
  import { computed, useAttrs, useSlots } from 'vue';

  import copy from 'copy-to-clipboard';

  import type { CopyComponentType, CopyProps } from './types';

  import { getPrefixCls } from '../_utils/global-config';
  import Button from '../button';
  import IconCopy from '../icon/icon-copy';
  import Link from '../link';
  import Message from '../message';
  import Tooltip from '../tooltip';

  defineOptions({
    name: 'Copy',
    inheritAttrs: false,
  });

  const props = withDefaults(defineProps<CopyProps>(), {
    content: '',
    tooltip: '复制',
    tooltipProps: undefined,
    clipboardProps: undefined,
    component: 'link',
    textInherit: true,
    successMessage: '复制成功',
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
  const prefixCls = getPrefixCls('copy');
  // 图标态（无默认插槽文案）时复用 tooltip 文案做无障碍名，避免 SR 只读到无名的图标按钮；
  // 消费者显式 aria-label 或有可见文案时优先之。
  const computedAriaLabel = computed(() => {
    const consumer = attrs['aria-label'];
    if (consumer !== undefined) return consumer as string;
    if (slots.default) return undefined;
    return props.tooltip;
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
  const mergedTooltipProps = computed(() => ({
    ...props.tooltipProps,
    content: props.tooltipProps?.content ?? props.tooltip,
  }));

  async function handleCopy() {
    if (isDisabled.value) {
      return;
    }

    await copy(props.content, props.clipboardProps);
    Message.success(props.successMessage);
    emit('copy', props.content);
  }
</script>
