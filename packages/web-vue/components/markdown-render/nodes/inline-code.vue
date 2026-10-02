<template>
  <TypographyText v-bind="nodeEvents" code
    ><slot>{{ node.code }}</slot></TypographyText
  >
</template>
<script setup lang="ts">
  import { TypographyText } from '../../typography';
  import { useNodeEvents } from './use-node-events';
  defineOptions({ inheritAttrs: false });
  const nodeEvents = useNodeEvents();
  defineProps<{ node: { code: string; raw: string } }>();
</script>
