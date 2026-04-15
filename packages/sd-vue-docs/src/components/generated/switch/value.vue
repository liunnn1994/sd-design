<template>
  <sd-space direction="vertical" size="large">
    <sd-switch v-model="value" checked-value="yes" unchecked-value="no" />
    <div>Current Value: {{ value }}</div>
  </sd-space>
</template>

<script>
  import { ref } from 'vue';

  export default {
    setup() {
      const value = ref('');

      return {
        value,
      };
    },
  };
</script>
