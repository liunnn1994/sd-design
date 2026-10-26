<template>
  <sd-space direction="vertical" size="large">
    <sd-radio-group type="button" v-model="size">
      <sd-radio value="mini">迷你</sd-radio>
      <sd-radio value="small">小</sd-radio>
      <sd-radio value="medium">中</sd-radio>
      <sd-radio value="large">大</sd-radio>
    </sd-radio-group>
    <sd-input-tag
      :default-value="['one']"
      class="sd:w-80"
      placeholder="请输入内容"
      :size="size"
      allow-clear
    />
  </sd-space>
</template>

<script setup lang="ts">
  import type { Size } from '@sdata/web-vue';

  import { ref } from 'vue';

  const size = ref<Size>('medium');
</script>
