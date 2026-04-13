<template>
  <a-space direction="vertical" size="large">
    <a-form :model="data" layout="inline">
      <a-form-item label="Step" field="step">
        <a-input-number :style="{ width: '100px' }" v-model="data.step" />
      </a-form-item>
      <a-form-item label="Show steps" field="showTicks">
        <a-switch v-model="data.showTicks" />
      </a-form-item>
    </a-form>
    <a-slider :default-value="20" :style="{ width: '300px' }" :step="data.step" :show-ticks="data.showTicks" />
  </a-space>
</template>

<script>
import { reactive } from 'vue';

export default {
  setup() {
    const data = reactive({
      step: 5,
      showTicks: true
    });

    return {
      data
    }
  },
}
</script>
