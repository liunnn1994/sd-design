<template>
  <sd-select class="sd:w-80" v-model="value" placeholder="请选择…" allow-clear :options="options" />
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const value = ref('上海');
  const options = ['北京', '上海', '广州', { label: '禁用', disabled: true }];
</script>
