<template>
  <details v-if="node.collapsible" v-bind="nodeEvents" :open="node.open">
    <summary>{{ node.title || node.kind }}</summary>
    <Alert :type="type"
      ><Children :nodes="node.children ?? []" :custom-id="customId" :index-key="indexKey"
    /></Alert>
  </details>
  <Alert v-else v-bind="nodeEvents" :type="type" :title="node.title || node.kind">
    <Children :nodes="node.children ?? []" :custom-id="customId" :index-key="indexKey" />
  </Alert>
</template>
<script setup lang="ts">
  import type { BaseNode } from 'markstream-vue';

  import { computed } from 'vue';

  import Alert from '../../alert';
  import Children from './children.vue';
  import { useNodeEvents } from './use-node-events';
  defineOptions({ inheritAttrs: false });
  const nodeEvents = useNodeEvents();
  const { node, customId, indexKey } = defineProps<{
    node: {
      kind: string;
      title?: string;
      children?: BaseNode[];
      collapsible?: boolean;
      open?: boolean;
    };
    customId?: string;
    indexKey?: string | number;
  }>();
  const type = computed(() =>
    ['danger', 'error'].includes(node.kind)
      ? 'error'
      : ['warning', 'caution'].includes(node.kind)
        ? 'warning'
        : node.kind === 'tip'
          ? 'success'
          : 'info',
  );
</script>
