<template>
  <sd-selectable-card
    label="专业版方案"
    :is-selected="selected"
    color="blue"
    variant="soft"
    layout="horizontal"
    size="large"
    width="420px"
    @change="selected = $event"
  >
    <template #figure>🚀</template>
    <template #title>专业版</template>
    <template #value>¥299 / 月</template>
    <template #description>包含高级权限与审计能力</template>
    <template #actions>
      <sd-tag color="blue">推荐</sd-tag>
      <sd-button size="mini">查看详情</sd-button>
    </template>
  </sd-selectable-card>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const selected = ref(true);
</script>
