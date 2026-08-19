<template>
  <div class="bloom-menu-demo">
    <sd-bloom-menu v-model="open" :items="items" title="受控菜单" trigger-text="打开菜单" />
    <sd-button size="small" @click="open = !open">
      {{ open ? '从外部关闭' : '从外部打开' }}
    </sd-button>
  </div>
</template>

<script setup lang="ts">
  import type { BloomMenuItem } from '@sdata/web-vue';

  import { ref } from 'vue';

  import { IconFile, IconFolder, IconLink } from '@sdata/web-vue/es/icon/index.js';

  const open = ref(false);
  const items: BloomMenuItem[] = [
    { value: 'doc', label: '文档', icon: IconFile },
    { value: 'folder', label: '文件夹', icon: IconFolder },
    { value: 'link', label: '链接', icon: IconLink },
  ];
</script>

<style scoped>
  .bloom-menu-demo {
    display: flex;
    gap: 16px;
    align-items: center;
    justify-content: center;
    min-height: 320px;
  }
</style>
