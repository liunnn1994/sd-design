<template>
  <sd-select class="sd:w-80" placeholder="请选择…" loading :options="options" />
</template>

<script setup lang="ts">
  const options = ['北京', '上海', '广州', { label: '禁用', disabled: true }];
</script>
