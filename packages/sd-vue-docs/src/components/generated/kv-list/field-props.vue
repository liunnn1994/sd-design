<template>
  <KvList
    v-model:json="json"
    v-model:bulk="bulk"
    :key-props="{ placeholder: '配置项', allowClear: true }"
    :value-props="{ placeholder: '配置值', maxLength: 32 }"
  />
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  import { KvList } from '@sdata/web-vue';

  const json = ref([{ key: '', value: '' }]);
  const bulk = ref('');
</script>
