<template>
  <div class="demo">
    <KvList v-model:json="json" v-model:bulk="bulk" />
    <pre>{{ json }}</pre>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  import { KvList } from '@sdata/web-vue';

  const json = ref([
    { key: 'region', value: 'cn-north' },
    { key: 'environment', value: 'production' },
  ]);
  const bulk = ref('');
</script>

<style scoped>
  .demo {
    display: grid;
    gap: 16px;
  }

  pre {
    margin: 0;
    padding: 12px;
    overflow: auto;
    background: var(--sd-color-fill-1);
    border-radius: 4px;
  }
</style>
