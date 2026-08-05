<template>
  <sd-space wrap size="large">
    <div v-for="item in states" :key="item.value" class="state-item">
      <sd-thinking-orb :state="item.value" />
      <span>{{ item.label }}</span>
    </div>
  </sd-space>
</template>

<script setup lang="ts">
  import type { ThinkingOrbState } from '@sdata/web-vue';

  const states: Array<{ label: string; value: ThinkingOrbState }> = [
    { label: '工作', value: 'working' },
    { label: '搜索', value: 'searching' },
    { label: '求解', value: 'solving' },
    { label: '聆听', value: 'listening' },
    { label: '连接', value: 'connecting' },
    { label: '编织', value: 'weaving' },
    { label: '组织', value: 'composing' },
    { label: '思考', value: 'breathing' },
    { label: '塑形', value: 'shaping' },
  ];
</script>

<style scoped>
  .state-item {
    display: grid;
    gap: 8px;
    justify-items: center;
    min-width: 72px;
  }
</style>
