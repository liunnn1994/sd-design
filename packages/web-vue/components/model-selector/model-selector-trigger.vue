<template>
  <Button
    :class="prefixCls"
    :aria-expanded="context.visible.value"
    aria-haspopup="dialog"
    :disabled="disabled"
    @click="context.setVisible(!context.visible.value)"
  >
    <slot
      :close="() => context.setVisible(false)"
      :open="() => context.setVisible(true)"
      :visible="context.visible.value"
    />
  </Button>
</template>

<script setup lang="ts">
  import { getPrefixCls } from '../_utils/global-config';
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

  const prefixCls = getPrefixCls('model-selector-trigger');
  const context = useModelSelectorContext('ModelSelectorTrigger');
</script>
