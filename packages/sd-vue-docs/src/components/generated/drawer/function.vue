<template>
  <sd-button type="primary" @click="handleClick">打开抽屉</sd-button>
</template>

<script setup lang="ts">
  import { Drawer } from '@sdata/web-vue';

  const handleClick = () => {
    Drawer.open({
      title: '提示标题',
      content: '这是一条提示消息',
      width: 340,
    });
  };
</script>
