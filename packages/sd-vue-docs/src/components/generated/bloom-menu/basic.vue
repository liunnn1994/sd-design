<template>
  <div class="bloom-menu-demo">
    <sd-bloom-menu
      :items="items"
      title="创建"
      trigger-text="创建"
      :button-props="{ style: { width: '144px', height: '44px' } }"
      @select="handleSelect"
    />
    <p>最近选择：{{ selectedLabel || '暂无' }}</p>
  </div>
</template>

<script setup lang="ts">
  import type { BloomMenuItem } from '@sdata/web-vue';

  import { ref } from 'vue';

  import {
    IconApps,
    IconFile,
    IconFolder,
    IconLink,
    IconList,
    IconNotification,
  } from '@sdata/web-vue/es/icon/index.js';

  const items: BloomMenuItem[] = [
    { value: 'doc', label: '文档', icon: IconFile },
    { value: 'board', label: '看板', icon: IconApps },
    { value: 'table', label: '表格', icon: IconList },
    { value: 'folder', label: '文件夹', icon: IconFolder },
    { value: 'reminder', label: '提醒', icon: IconNotification },
    { value: 'link', label: '链接', icon: IconLink },
  ];
  const selectedLabel = ref('');

  function handleSelect(item: BloomMenuItem) {
    selectedLabel.value = item.label;
  }
</script>

<style scoped>
  .bloom-menu-demo {
    display: grid;
    place-items: center;
    min-height: 320px;
  }

  p {
    margin: 20px 0 0;
    color: var(--sd-color-text-2);
  }
</style>
