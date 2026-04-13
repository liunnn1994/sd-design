<template>
  <a-select :style="{ width: '320px' }" v-model="value" placeholder="Please select ..." allow-clear>
    <a-option>Beijing</a-option>
    <a-option>Shanghai</a-option>
    <a-option>Guangzhou</a-option>
    <a-option disabled>Disabled</a-option>
  </a-select>
</template>

<script>
  import { ref } from 'vue';

  export default {
    setup() {
      const value = ref('Shanghai');
      return {
        value,
      };
    },
  };
</script>
