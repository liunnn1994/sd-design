<script setup lang="ts">
  import { ref, useId } from 'vue';

  const id = `anchor-line-less-${useId()}`;
  const content = ref<HTMLElement>();
  const sections = [
    { key: 'basic', title: 'Basic' },
    { key: 'line-less', title: 'LineLess Mode' },
    { key: 'affix', title: 'Affix' },
    { key: 'boundary', title: 'Scroll Boundary' },
    { key: 'hash', title: 'Hash mode' },
  ];
</script>

<template>
  <div class="anchor-line-less-demo" data-anchor-demo="line-less">
    <sd-anchor :scroll-container="content" line-less>
      <sd-anchor-link :href="`#${id}-basic`">Basic</sd-anchor-link>
      <sd-anchor-link :href="`#${id}-line-less`">LineLess Mode</sd-anchor-link>
      <sd-anchor-link :href="`#${id}-affix`">
        Affix
        <template #sublist>
          <sd-anchor-link :href="`#${id}-boundary`">Scroll Boundary</sd-anchor-link>
          <sd-anchor-link :href="`#${id}-hash`">Hash mode</sd-anchor-link>
        </template>
      </sd-anchor-link>
    </sd-anchor>
    <div
      ref="content"
      class="anchor-line-less-content"
      data-anchor-content
      tabindex="0"
      aria-label="锚点示例内容"
    >
      <section v-for="section in sections" :id="`${id}-${section.key}`" :key="section.key">
        <h4>{{ section.title }}</h4>
        <p>点击左侧锚点，滚动到对应的内容区域。</p>
      </section>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .anchor-line-less-demo {
    display: grid;
    grid-template-columns: minmax(100px, 160px) minmax(0, 1fr);
    gap: 16px;
    align-items: start;
  }

  .anchor-line-less-demo :deep(.sd-anchor) {
    width: 100%;
    background: var(--sd-color-bg-2);
  }

  .anchor-line-less-content {
    height: 240px;
    overflow: auto;
    border: 1px solid var(--sd-color-border-2);
    border-radius: 6px;

    section {
      min-height: 240px;
      padding: 16px;
    }
  }
</style>
