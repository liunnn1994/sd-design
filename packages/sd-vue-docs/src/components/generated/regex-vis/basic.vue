<template>
  <div class="regex-vis-demo">
    <sd-regex-vis class="regex-vis-demo-component" v-model="value" v-model:flags="flags" />
    <p>当前表达式：/{{ value }}/{{ flags.join('') }}</p>
  </div>
</template>

<script setup lang="ts">
  import type { RegexVisFlag } from '@sdata/web-vue';

  import { ref } from 'vue';

  const value = ref('^[a-z0-9_-]{3,16}$');
  const flags = ref<RegexVisFlag[]>(['i']);
</script>

<style scoped>
  .regex-vis-demo {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 12px;
    min-width: 0;
  }

  .regex-vis-demo-component {
    width: 100%;
    min-width: 0;
    max-width: 100%;
  }

  p {
    margin: 0;
    color: var(--sd-color-text-2);
    font-family: consolas, menlo, monospace;
    overflow-wrap: anywhere;
  }
</style>
