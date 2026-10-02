<template>
  <Checkbox
    v-bind="nodeEvents"
    :model-value="node.checked"
    disabled
    :aria-label="node.checked ? 'checked' : 'unchecked'"
  />
</template>
<script setup lang="ts">
  import Checkbox from '../../checkbox';
  import { useNodeEvents } from './use-node-events';
  defineOptions({ inheritAttrs: false });
  const nodeEvents = useNodeEvents();
  defineProps<{ node: { checked: boolean } }>();
</script>
