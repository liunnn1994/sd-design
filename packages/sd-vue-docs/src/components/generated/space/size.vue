<template>
  <div>
    <div class="sd:mb-5">
      <sd-radio-group v-model="size" type="button">
        <sd-radio value="mini">迷你</sd-radio>
        <sd-radio value="small">小</sd-radio>
        <sd-radio value="medium">中</sd-radio>
        <sd-radio value="large">大</sd-radio>
      </sd-radio-group>
    </div>
    <sd-space :size="size">
      <sd-button type="primary">项目 1</sd-button>
      <sd-button type="primary">项目 2</sd-button>
      <sd-button type="primary">项目 3</sd-button>
    </sd-space>
  </div>
</template>
<script setup lang="ts">
  import { shallowRef } from 'vue';

  const size = shallowRef<'mini' | 'small' | 'medium' | 'large'>('medium');
</script>
