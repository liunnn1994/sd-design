<template>
  <div v-bind="nodeEvents">
    <TypographyTitle v-if="node.type === 'heading'" v-bind="node.attrs" :heading="heading">
      <Children :nodes="node.children ?? []" :custom-id="customId" :index-key="indexKey" />
    </TypographyTitle>
    <TypographyParagraph v-else :blockquote="node.type === 'blockquote'" :cite="node.cite">
      <Children :nodes="node.children ?? []" :custom-id="customId" :index-key="indexKey" />
    </TypographyParagraph>
  </div>
</template>
<script setup lang="ts">
  import { computed } from 'vue';

  import type { MarkdownContainerProps } from '../types';

  import { TypographyTitle, TypographyParagraph } from '../../typography';
  import Children from './children.vue';
  import { useNodeEvents } from './use-node-events';
  defineOptions({ inheritAttrs: false });
  const nodeEvents = useNodeEvents();
  const { node, customId, indexKey } = defineProps<MarkdownContainerProps>();
  const heading = computed(
    () => Math.max(1, Math.min(6, node.level ?? 1)) as 1 | 2 | 3 | 4 | 5 | 6,
  );
</script>
