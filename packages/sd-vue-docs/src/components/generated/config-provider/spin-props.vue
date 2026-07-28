<template>
  <sd-config-provider
    :spin-props="{ delay: true }"
    :table-spin-props="{ delay: 800, tip: '表格加载中' }"
  >
    <sd-space direction="vertical" fill>
      <sd-button @click="loading = !loading">
        {{ loading ? '结束加载' : '开始加载' }}
      </sd-button>
      <sd-spin :loading="loading">
        <sd-card title="通用 Spin">继承 400ms 延迟。</sd-card>
      </sd-spin>
      <sd-table :columns="columns" :data="data" :loading="loading" :pagination="false" />
    </sd-space>
  </sd-config-provider>
</template>

<script setup lang="ts">
  import { shallowRef } from 'vue';

  const loading = shallowRef(false);
  const columns = [
    { title: '姓名', dataIndex: 'name' },
    { title: '角色', dataIndex: 'role' },
  ];
  const data = [{ key: '1', name: '张三', role: '管理员' }];
</script>
