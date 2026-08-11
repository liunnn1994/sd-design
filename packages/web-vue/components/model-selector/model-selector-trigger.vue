<template>
  <TriggerElement
    :class="prefixCls"
    :aria-expanded="context.visible.value"
    :aria-disabled="disabled || undefined"
    aria-haspopup="dialog"
    :disabled="disabled"
    @click="handleClick"
  >
    <slot
      :close="() => context.setVisible(false)"
      :disabled="disabled"
      :open="() => context.setVisible(true)"
      :visible="context.visible.value"
    />
  </TriggerElement>
</template>

<script setup lang="ts">
  import { getPrefixCls } from '../_utils/global-config';
  import TriggerElement from './model-selector-trigger-element.vue';
  import { useModelSelectorContext } from './use-model-selector-context';

  defineOptions({ name: 'ModelSelectorTrigger' });

  const { disabled = false } = defineProps<{
    /**
     * @zh 是否禁用触发器
     * @en Whether the trigger is disabled
     */
    disabled?: boolean;
  }>();

  defineSlots<{
    /**
     * @zh 自定义触发元素
     * @en Custom trigger element
     */
    default(props: {
      close: () => void;
      disabled: boolean;
      open: () => void;
      visible: boolean;
    }): unknown;
  }>();

  const prefixCls = getPrefixCls('model-selector-trigger');
  const context = useModelSelectorContext('ModelSelectorTrigger');

  function handleClick(event: MouseEvent) {
    if (disabled) {
      event.preventDefault();
      return;
    }

    context.setVisible(!context.visible.value);
  }
</script>
