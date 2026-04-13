<template>
  <a-space direction="vertical" size="large">
    <a-radio-group type="button" v-model="size">
      <a-radio value="mini">mini</a-radio>
      <a-radio value="small">small</a-radio>
      <a-radio value="medium">medium</a-radio>
      <a-radio value="large">large</a-radio>
    </a-radio-group>
    <a-input-tag
      :default-value="['one']"
      :style="{ width: '320px' }"
      placeholder="Please enter something"
      :size="size"
      allow-clear
    />
  </a-space>
</template>

<script>
  import { ref } from 'vue';

  export default {
    setup() {
      const size = ref('medium');

      return {
        size,
      };
    },
  };
</script>
