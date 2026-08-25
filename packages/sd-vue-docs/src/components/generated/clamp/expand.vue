<template>
  <sd-line-clamp v-model:expanded="expanded" :text="text" :max-lines="2" class="clamp-demo">
    <template #after="{ clamped, expanded: current, toggle }">
      <sd-button v-if="clamped || current" type="text" size="mini" @click="toggle">
        {{ current ? '收起' : '展开' }}
      </sd-button>
    </template>
  </sd-line-clamp>
</template>

<script setup lang="ts">
  import { shallowRef } from 'vue';

  const expanded = shallowRef(false);
  const text =
    '通过 expanded 模型和 after 插槽可以组合展开控件。插槽同时提供 expand、collapse、toggle、clamped 与 expanded 状态。';
</script>

<style scoped>
  .clamp-demo {
    width: min(100%, 16rem);
  }
</style>
