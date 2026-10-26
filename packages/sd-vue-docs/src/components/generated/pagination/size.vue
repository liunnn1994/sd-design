<template>
  <sd-space direction="vertical" size="large">
    <sd-radio-group type="button" v-model="size">
      <sd-radio value="mini">迷你</sd-radio>
      <sd-radio value="small">小</sd-radio>
      <sd-radio value="medium">中</sd-radio>
      <sd-radio value="large">大</sd-radio>
    </sd-radio-group>
    <sd-pagination :total="50" :size="size" show-total show-jumper show-page-size />
  </sd-space>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const size = ref<'mini' | 'small' | 'medium' | 'large'>('medium');
</script>
