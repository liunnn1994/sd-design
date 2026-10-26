<template>
  <sd-space direction="vertical" size="large">
    <div>在搜索选项后显示已选项</div>
    <sd-select
      class="sd:w-80"
      :options="options"
      :loading="loading"
      placeholder="请选择…"
      multiple
      @search="handleSearch"
      :filter-option="false"
    />
    <div>在搜索选项后隐藏已选项</div>
    <sd-select
      :options="options"
      class="sd:w-80"
      :loading="loading"
      placeholder="请选择…"
      multiple
      @search="handleSearch"
      :filter-option="false"
      :show-extra-options="false"
    />
  </sd-space>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const options = ref(['选项 1', '选项 2', '选项 3']);
  const loading = ref(false);

  const handleSearch = (value: string) => {
    if (value) {
      loading.value = true;
      window.setTimeout(() => {
        options.value = [`${value}-Option1`, `${value}-Option2`, `${value}-Option3`];
        loading.value = false;
      }, 2000);
    } else {
      options.value = [];
    }
  };
</script>
