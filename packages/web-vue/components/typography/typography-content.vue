<template>
  <component :is="outerTag" v-if="outerTag" :style="outerTag === 'mark' ? markStyle : undefined">
    <TypographyContent :content="content" :tags="innerTags" :mark-style="markStyle" />
  </component>
  <VNodeRenderer v-else :content="content" />
</template>

<script setup lang="ts">
  import type { CSSProperties, VNodeChild } from 'vue';
  import { computed } from 'vue';

  defineOptions({ name: 'TypographyContent' });

  const props = defineProps<{
    content?: VNodeChild;
    tags: (keyof HTMLElementTagNameMap)[];
    markStyle?: CSSProperties;
  }>();

  const VNodeRenderer = ({ content }: { content?: VNodeChild }) => content;
  const outerTag = computed(() => props.tags.at(-1));
  const innerTags = computed(() => props.tags.slice(0, -1));
</script>
