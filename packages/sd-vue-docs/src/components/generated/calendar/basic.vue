<template>
  <a-calendar v-model="value" />
  select: {{ value }}
</template>

<script>
  import { ref } from 'vue';

  export default {
    setup() {
      const value = ref(new Date('2023-01-01'));

      return {
        value,
      };
    },
  };
</script>
