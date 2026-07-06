<template>
  <sd-toolbar v-model="formState" :schemas="schemas" @search="onSearch">
    <template #keyword>
      <sd-input
        v-model="formState.keyword"
        placeholder="请输入关键字"
        allow-clear
        style="width: 220px"
      />
    </template>

    <template #action-prepend>
      <sd-button>导入</sd-button>
    </template>

    <template #action-append>
      <sd-button type="outline">导出</sd-button>
    </template>
  </sd-toolbar>

  <sd-alert type="info"> 当前查询条件：{{ JSON.stringify(formState) }} </sd-alert>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  import { defineJsonFormSchemas } from '@sdata/web-vue';

  const formState = ref({
    keyword: '',
  });

  const createSchemas = defineJsonFormSchemas();
  const schemas = createSchemas([
    {
      field: 'keyword',
      label: '关键字',
      slotName: 'keyword',
    },
  ]);

  function onSearch(params: Record<string, unknown>) {
    console.log('search', params);
  }
</script>
