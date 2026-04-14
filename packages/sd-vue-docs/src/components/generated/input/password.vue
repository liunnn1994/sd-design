<template>
  <a-space direction="vertical" size="large">
    <a-switch v-model="visibility" />
    <a-input-password
      v-model:visibility="visibility"
      placeholder="Please enter something"
      :style="{ width: '320px' }"
      :defaultVisibility="false"
      allow-clear
    />
  </a-space>
</template>

<script>
  import { ref } from 'vue';

  export default {
    setup() {
      const visibility = ref(true);

      return {
        visibility,
      };
    },
  };
</script>
