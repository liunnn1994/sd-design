<template>
  <a-radio-group v-model="checkedValue">
    <a-grid :cols="3" :colGap="24" :rowGap="16">
      <a-grid-item>
        <a-radio value="1">Option 1</a-radio>
      </a-grid-item>
      <a-grid-item>
        <a-radio value="2" disabled>Option 2</a-radio>
      </a-grid-item>
      <a-grid-item>
        <a-radio value="3">Option 3</a-radio>
      </a-grid-item>
      <a-grid-item>
        <a-radio value="4">Option 4</a-radio>
      </a-grid-item>
      <a-grid-item>
        <a-radio value="5">Option 5</a-radio>
      </a-grid-item>
    </a-grid>
  </a-radio-group>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const checkedValue = ref('1');

    return {
      checkedValue,
    };
  },
};
</script>
