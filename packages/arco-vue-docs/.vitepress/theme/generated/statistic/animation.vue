<template>
  <a-statistic title="User Growth Rate" :value="50.52" :precision="2" :value-from="0" :start="start" animation>
    <template #prefix>
      <icon-arrow-rise />
    </template>
    <template #suffix>%</template>
  </a-statistic>
  <a-button @click="start=true">Start</a-button>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const start = ref(false);

    return {
      start
    }
  },
}
</script>
