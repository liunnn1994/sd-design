<script setup lang="ts">
  import { ref, useId } from 'vue';

  const id = `anchor-affix-${useId()}`;
  const content = ref<HTMLElement>();
  const sections = [
    { key: 'basic', title: '基础' },
    { key: 'line-less', title: '无线模式' },
    { key: 'affix', title: '固钉' },
    { key: 'boundary', title: '滚动边界' },
    { key: 'hash', title: '哈希模式' },
  ];
</script>

<template>
  <div
    ref="content"
    class="anchor-affix-demo"
    data-anchor-demo="affix"
    data-anchor-content
    tabindex="0"
    aria-label="锚点示例内容"
  >
    <sd-affix :target="content" :offsetTop="0">
      <sd-anchor :scroll-container="content">
        <sd-anchor-link :href="`#${id}-basic`">基础</sd-anchor-link>
        <sd-anchor-link :href="`#${id}-line-less`">无线模式</sd-anchor-link>
        <sd-anchor-link :href="`#${id}-affix`">
          固钉
          <template #sublist>
            <sd-anchor-link :href="`#${id}-boundary`">滚动边界</sd-anchor-link>
            <sd-anchor-link :href="`#${id}-hash`">哈希模式</sd-anchor-link>
          </template>
        </sd-anchor-link>
      </sd-anchor>
    </sd-affix>
    <div class="anchor-affix-content">
      <section v-for="section in sections" :id="`${id}-${section.key}`" :key="section.key">
        <h4>{{ section.title }}</h4>
        <p>点击左侧锚点，滚动到对应的内容区域。</p>
      </section>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .anchor-affix-demo {
    display: grid;
    grid-template-columns: minmax(100px, 160px) minmax(0, 1fr);
    gap: 16px;
    align-items: start;
    height: 240px;
    overflow: auto;
  }

  .anchor-affix-demo :deep(.sd-anchor) {
    width: 100%;
    background: var(--sd-color-bg-2);
  }

  .anchor-affix-content {
    border: 1px solid var(--sd-color-border-2);
    border-radius: 6px;

    section {
      min-height: 240px;
      padding: 16px;
    }
  }
</style>
