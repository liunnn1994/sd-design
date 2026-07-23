<template>
  <KvList v-model:json="json" v-model:bulk="bulk">
    <template #key="{ value, update, props }">
      <Select
        v-bind="props"
        :model-value="value"
        :options="keyOptions"
        placeholder="选择配置项"
        @update:model-value="update"
      />
    </template>
    <template #value="{ value, update, props }">
      <Input v-bind="props" :model-value="value" allow-clear @update:model-value="update" />
    </template>
  </KvList>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  import { Input, KvList, Select } from '@sdata/web-vue';

  const json = ref([{ key: 'timeout', value: '30' }]);
  const bulk = ref('');
  const keyOptions = ['timeout', 'retries', 'region'];
</script>
