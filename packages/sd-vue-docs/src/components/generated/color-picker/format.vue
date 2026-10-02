<template>
  <sd-space direction="vertical">
    <sd-radio-group type="button" v-model="format">
      <sd-radio v-for="item in formatList" :value="item">{{ item }}</sd-radio>
    </sd-radio-group>
    <sd-color-picker defaultValue="#165DFF" :format="format" enableAlpha />
  </sd-space>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  type DemoFormat = 'HEX' | 'RGBA' | 'HSL' | 'HSV' | 'CSS';
  const format = ref<DemoFormat>('RGBA');
  const formatList: DemoFormat[] = ['HEX', 'RGBA', 'HSL', 'HSV', 'CSS'];
</script>
