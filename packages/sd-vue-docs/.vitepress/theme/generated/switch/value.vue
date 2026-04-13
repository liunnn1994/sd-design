<template>
  <a-space direction="vertical" size="large">
    <a-switch v-model="value" checked-value="yes" unchecked-value="no" />
    <div>Current Value: {{ value }}</div>
  </a-space>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const value = ref('');

    return {
      value
    }
  },
}
</script>
