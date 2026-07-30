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
  import { defineComponent, h } from 'vue';

  import { getPrefixCls } from '../_utils/global-config';
  import { mergeFirstChild } from '../_utils/vue-utils';
  import Button from '../button';
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

  const TriggerElement = defineComponent({
    name: 'ModelSelectorTriggerElement',
    inheritAttrs: false,
    setup: (_, { attrs, slots }) => {
      return () => {
        const children = slots.default?.() ?? [];
        if (mergeFirstChild(children, attrs)) {
          return children;
        }

        return h(Button, attrs, { default: () => children });
      };
    },
  });

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
