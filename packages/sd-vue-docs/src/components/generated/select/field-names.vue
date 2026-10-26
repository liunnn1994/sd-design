<template>
  <sd-select
    v-model="value"
    :options="options"
    :field-names="fieldNames"
    class="sd:w-80"
    placeholder="请选择…"
  />
</template>

<script setup lang="ts">
  import { reactive, ref } from 'vue';

  const value = ref('bj');
  const fieldNames = { value: 'city', label: 'text' };
  const options = reactive([
    {
      city: 'bj',
      text: '北京',
    },
    {
      city: 'sh',
      text: '上海',
    },
    {
      city: 'gz',
      text: '广州',
    },
    {
      city: 'cd',
      text: '成都',
    },
  ]);
</script>
