<template>
  <sd-auto-complete :data="data" class="sd:w-90" placeholder="请输入内容" strict />
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const data = ref(['北京', '上海', '成都', '武汉']);
</script>
