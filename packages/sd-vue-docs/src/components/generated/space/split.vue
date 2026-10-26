<template>
  <sd-space>
    <template #split>
      <sd-divider direction="vertical" :margin="0" />
    </template>
    <sd-button type="primary">项目 1</sd-button>
    <sd-tag v-if="show" color="sdblue">标签</sd-tag>
    <sd-button type="primary">项目 2</sd-button>
    <sd-button type="primary">项目 3</sd-button>
    <sd-switch v-model="show" />
  </sd-space>
  <sd-divider />
  <sd-space>
    <template #split>
      <sd-divider direction="vertical" :margin="0" />
    </template>
    <sd-link type="primary">链接 1</sd-link>
    <sd-link type="primary">链接 2</sd-link>
    <sd-link type="primary">链接 3</sd-link>
  </sd-space>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const show = ref(false);
</script>
