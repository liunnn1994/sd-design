<template>
  <sd-space direction="vertical" size="large">
    <sd-input-number
      v-model="value"
      placeholder="请输入"
      class="input-demo sd:w-80"
      :min="10"
      :max="100"
    />
    <sd-input-number placeholder="请输入" class="input-demo sd:w-80" :min="10" :max="100" />
    <sd-input-number
      placeholder="请输入"
      :default-value="500"
      class="input-demo sd:w-80"
      disabled
    />
  </sd-space>
</template>

<script setup lang="ts">
  import { shallowRef } from 'vue';

  const value = shallowRef(15);
</script>
