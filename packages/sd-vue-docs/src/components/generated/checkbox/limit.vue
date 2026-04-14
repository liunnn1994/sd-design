<template>
  <a-space direction="vertical" size="large">
    <a-checkbox-group :max="2" v-model="value1" :options="plainOptions" />
    <a-checkbox-group :max="2" :default-value="['1']">
      <a-checkbox value="1" disabled>Option 1</a-checkbox>
      <a-checkbox value="2">Option 2</a-checkbox>
      <a-checkbox value="3">Option 3</a-checkbox>
      <a-checkbox value="4">Option 4</a-checkbox>
    </a-checkbox-group>
  </a-space>
</template>

<script>
  import { ref } from 'vue';

  export default {
    setup() {
      const value1 = ref(['Plain 1']);
      const plainOptions = ['Plain 1', 'Plain 2', 'Plain 3', 'Plain 4'];

      return {
        plainOptions,
        value1,
      };
    },
  };
</script>
