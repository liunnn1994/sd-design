<template>
  <sd-slider v-model="value" :style="{ width: '300px' }" range />
</template>

<script>
  import { ref } from 'vue';

  export default {
    setup() {
      const value = ref([5, 10]);

      return {
        value,
      };
    },
  };
</script>
