<template>
  <sd-space direction="vertical" size="large">
    <sd-select class="sd:w-80" placeholder="请选择…" allow-search :options="options" />
    <sd-select
      class="sd:w-80"
      placeholder="请选择…"
      :allow-search="{ retainInputValue: true }"
      :options="options"
    />
    <sd-select
      :options="remoteOptions"
      class="sd:w-80"
      :loading="loading"
      placeholder="请选择…"
      multiple
      @search="handleSearch"
    />
  </sd-space>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const options = [
    '北京',
    '上海',
    '广州',
    { label: '禁用', value: '禁用', disabled: true },
    '深圳',
    '成都',
    '武汉',
  ];
  const remoteOptions = ref(['选项 1', '选项 2', '选项 3']);
  const loading = ref(false);

  const handleSearch = (value: string) => {
    if (value) {
      loading.value = true;
      window.setTimeout(() => {
        remoteOptions.value = [`${value}-Option1`, `${value}-Option2`, `${value}-Option3`];
        loading.value = false;
      }, 2000);
    } else {
      remoteOptions.value = [];
    }
  };
</script>
