<template>
  <div><VNodeRenderer :content="content" /></div>
</template>

<script setup lang="ts">
  import type { VNodeChild } from 'vue';

  defineOptions({ name: 'TypographyInnerTextRenderer' });

  defineProps<{
    content: VNodeChild;
  }>();

  const VNodeRenderer = ({ content }: { content: VNodeChild }) => content;
</script>
