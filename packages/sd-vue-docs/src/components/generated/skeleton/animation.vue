<template>
  <sd-space direction="vertical" size="large" :style="{ width: '100%' }">
    <sd-space>
      <span>Animation</span>
      <sd-switch v-model="animation" />
    </sd-space>
    <sd-skeleton :animation="animation">
      <sd-space direction="vertical" :style="{ width: '100%' }" size="large">
        <sd-skeleton-line :rows="3" />
        <sd-skeleton-shape />
      </sd-space>
    </sd-skeleton>
  </sd-space>
</template>

<script>
  import { ref } from 'vue';

  export default {
    setup() {
      const animation = ref(true);

      return {
        animation,
      };
    },
  };
</script>
