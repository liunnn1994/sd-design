<script setup lang="ts">
  import { ref } from 'vue';

  import { Button, Checkbox, Space } from '@sdata/web-vue';
  import { IconPlus } from '@sdata/web-vue/es/icon/index.js';

  const ellipsis = ref(true);
  const text = '这是一段较长的按钮内容，超出宽度后显示省略号';
</script>

<template>
  <Space direction="vertical" align="start">
    <Checkbox v-model="ellipsis">开启省略</Checkbox>
    <Button :ellipsis="ellipsis" style="width: 180px">{{ text }}</Button>
    <Button :ellipsis="ellipsis" type="primary" style="width: 180px">
      <template #icon><IconPlus /></template>
      {{ text }}
    </Button>
    <Button :ellipsis="ellipsis" href="#" style="width: 180px" @click.prevent>{{ text }}</Button>
    <Button
      :ellipsis="ellipsis"
      :ellipsis-line-clamp="2"
      ellipsis-expand-trigger="click"
      :ellipsis-tooltip="false"
      style="width: 180px; height: auto"
    >
      {{ text }}
    </Button>
  </Space>
</template>
