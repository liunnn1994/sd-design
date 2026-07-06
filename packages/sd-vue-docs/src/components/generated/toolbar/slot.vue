<template>
  <sd-toolbar v-model="formState" @search="onSearch">
    <sd-space>
      <sd-input
        v-model="formState.name"
        placeholder="请输入名称"
        allow-clear
        style="width: 200px"
      />
      <sd-select
        v-model="formState.status"
        placeholder="请选择状态"
        allow-clear
        style="width: 160px"
        :options="[
          { label: '运行中', value: 'running' },
          { label: '已停止', value: 'stopped' },
        ]"
      />
    </sd-space>
  </sd-toolbar>

  <sd-alert type="info"> 当前查询条件：{{ JSON.stringify(formState) }} </sd-alert>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const formState = ref({
    name: '',
    status: '',
  });

  function onSearch(params: Record<string, unknown>) {
    console.log('search', params);
  }
</script>
