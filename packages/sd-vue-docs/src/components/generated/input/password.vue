<template>
  <sd-space direction="vertical" size="large">
    <sd-switch v-model="visibility" />
    <sd-input-password
      v-model:visibility="visibility"
      placeholder="请输入内容"
      class="sd:w-80"
      :defaultVisibility="false"
      allow-clear
    />
  </sd-space>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const visibility = ref(true);
</script>
