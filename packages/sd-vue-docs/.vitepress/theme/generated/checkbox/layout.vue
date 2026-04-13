<template>
  <a-checkbox-group v-model="checkedValue">
    <a-grid :cols="3" :colGap="24" :rowGap="16">
      <a-grid-item>
        <a-checkbox value="1">Option 1</a-checkbox>
      </a-grid-item>
      <a-grid-item>
        <a-checkbox value="2" disabled>Option 2</a-checkbox>
      </a-grid-item>
      <a-grid-item>
        <a-checkbox value="3">Option 3</a-checkbox>
      </a-grid-item>
      <a-grid-item>
        <a-checkbox value="4">Option 4</a-checkbox>
      </a-grid-item>
      <a-grid-item>
        <a-checkbox value="5">Option 5</a-checkbox>
      </a-grid-item>
    </a-grid>
  </a-checkbox-group>
</template>

<script>
  import { ref } from 'vue';

  export default {
    setup() {
      const checkedValue = ref(['1', '2']);

      return {
        checkedValue,
      };
    },
  };
</script>
