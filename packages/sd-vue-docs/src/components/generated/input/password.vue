<template>
  <sd-space direction="vertical" size="large">
    <sd-switch v-model="visibility" />
    <sd-input-password
      v-model:visibility="visibility"
      placeholder="Please enter something"
      :style="{ width: '320px' }"
      :defaultVisibility="false"
      allow-clear
    />
  </sd-space>
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
