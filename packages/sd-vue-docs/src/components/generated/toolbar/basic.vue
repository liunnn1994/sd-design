<template>
  <sd-toolbar v-model="formState" :schemas="schemas" @search="onSearch" />

  <sd-alert type="info"> 当前查询条件：{{ JSON.stringify(formState) }} </sd-alert>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  import { defineJsonFormSchemas } from '@sdata/web-vue';

  const formState = ref({
    name: '',
    status: '',
  });

  const createSchemas = defineJsonFormSchemas();
  const schemas = createSchemas([
    {
      field: 'name',
      label: '名称',
      type: 'input',
      componentProps: { placeholder: '请输入名称', allowClear: true },
    },
    {
      field: 'status',
      label: '状态',
      type: 'select',
      componentProps: {
        placeholder: '请选择状态',
        allowClear: true,
        options: [
          { label: '运行中', value: 'running' },
          { label: '已停止', value: 'stopped' },
        ],
      },
    },
  ]);

  function onSearch(params: Record<string, unknown>) {
    console.log('search', params);
  }
</script>
