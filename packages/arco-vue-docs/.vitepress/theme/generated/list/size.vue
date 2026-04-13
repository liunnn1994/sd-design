<template>
  <a-space direction="vertical" size="large">
    <a-radio-group v-model="size" type="button">
      <a-radio value="small">Small</a-radio>
      <a-radio value="medium">Medium</a-radio>
      <a-radio value="large">Large</a-radio>
    </a-radio-group>
    <a-list :size="size">
      <template #header>
        List title
      </template>
      <a-list-item>Beijing Bytedance Technology Co., Ltd.</a-list-item>
      <a-list-item>Bytedance Technology Co., Ltd.</a-list-item>
      <a-list-item>Beijing Toutiao Technology Co., Ltd.</a-list-item>
      <a-list-item>Beijing Volcengine Technology Co., Ltd.</a-list-item>
      <a-list-item>China Beijing Bytedance Technology Co., Ltd.</a-list-item>
    </a-list>
  </a-space>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const size = ref('medium');

    return {
      size
    }
  },
}
</script>
