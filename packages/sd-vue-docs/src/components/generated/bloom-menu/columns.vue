<template>
  <div class="bloom-menu-demo">
    <sd-bloom-menu :items="items" :columns="2" title="快捷操作" trigger-text="两列菜单" />
  </div>
</template>

<script setup lang="ts">
  import type { BloomMenuItem } from '@sdata/web-vue';

  import {
    IconFile,
    IconFolder,
    IconLink,
    IconNotification,
  } from '@sdata/web-vue/es/icon/index.js';

  const items: BloomMenuItem[] = [
    { value: 'doc', label: '新建文档', icon: IconFile },
    { value: 'folder', label: '新建文件夹', icon: IconFolder },
    { value: 'reminder', label: '添加提醒', icon: IconNotification },
    { value: 'link', label: '添加链接', icon: IconLink },
  ];
</script>

<style scoped>
  .bloom-menu-demo {
    display: grid;
    place-items: center;
    min-height: 320px;
  }
</style>
