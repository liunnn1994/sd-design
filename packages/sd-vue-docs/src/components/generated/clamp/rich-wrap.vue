<template>
  <div class="sd:flex sd:flex-col sd:gap-4">
    <sd-rich-line-clamp :html="html" :max-lines="1" class="rich-clamp-demo" />

    <sd-wrap-clamp :items="items" item-key="id" :max-lines="1" class="wrap-clamp-demo">
      <template #item="{ item }">
        <sd-tag>{{ item.label }}</sd-tag>
      </template>
      <template #after="{ clamped, hiddenItems }">
        <sd-tag v-if="clamped">+{{ hiddenItems.length }}</sd-tag>
      </template>
    </sd-wrap-clamp>
  </div>
</template>

<script setup lang="ts">
  const html = '<strong>RichLineClamp</strong> 保留可信内联 HTML 的格式并按行裁剪。';
  const items = [
    { id: 1, label: '设计' },
    { id: 2, label: '开发' },
    { id: 3, label: '测试' },
    { id: 4, label: '文档' },
  ];
</script>

<style scoped>
  .rich-clamp-demo {
    width: min(100%, 16rem);
  }

  .wrap-clamp-demo {
    width: min(100%, 8rem);
  }

  .wrap-clamp-demo :deep([data-part='content']) {
    align-items: center;
    gap: 0.5rem;
  }
</style>
