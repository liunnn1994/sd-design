<template>
  <sd-space direction="vertical" size="large">
    <sd-auto-complete
      :data="data"
      @search="handleSearch"
      class="sd:w-90"
      placeholder="please enter something"
    >
      <template #prefix>
        <icon-user />
      </template>
    </sd-auto-complete>
    <sd-auto-complete
      :data="data"
      @search="handleSearch"
      class="sd:w-90"
      placeholder="please enter something"
      allow-clear
    >
      <template #suffix>
        <icon-info-circle />
      </template>
    </sd-auto-complete>
  </sd-space>
</template>

<script setup lang="ts">
  import type { AutoCompleteData, AutoCompleteSearchHandler } from '@sdata/web-vue';

  import { ref } from 'vue';

  const data = ref<AutoCompleteData>([]);

  const handleSearch: AutoCompleteSearchHandler = (value) => {
    if (value) {
      data.value = [...Array(5)].map((_, index) => `${value}-${index}`);
    } else {
      data.value = [];
    }
  };
</script>
