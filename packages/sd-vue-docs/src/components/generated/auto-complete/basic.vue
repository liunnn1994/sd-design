<template>
  <sd-auto-complete :data="data" @search="handleSearch" class="sd:w-90" placeholder="请输入内容" />
</template>

<script setup lang="ts">
  import type { AutoCompleteData, AutoCompleteSearchHandler } from '@sdata/web-vue';

  import { ref } from 'vue';

  const data = ref<AutoCompleteData>([]);

  const handleSearch: AutoCompleteSearchHandler = (value) => {
    if (value) {
      data.value = [...Array(5)].map((_, index) => `${value}-${index}`);
      console.log(data.value);
    } else {
      data.value = [];
    }
  };
</script>
