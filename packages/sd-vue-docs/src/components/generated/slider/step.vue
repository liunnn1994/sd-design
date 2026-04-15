<template>
  <sd-space direction="vertical" size="large">
    <sd-form :model="data" layout="inline">
      <sd-form-item label="Step" field="step">
        <sd-input-number :style="{ width: '100px' }" v-model="data.step" />
      </sd-form-item>
      <sd-form-item label="Show steps" field="showTicks">
        <sd-switch v-model="data.showTicks" />
      </sd-form-item>
    </sd-form>
    <sd-slider
      :default-value="20"
      :style="{ width: '300px' }"
      :step="data.step"
      :show-ticks="data.showTicks"
    />
  </sd-space>
</template>

<script>
  import { reactive } from 'vue';

  export default {
    setup() {
      const data = reactive({
        step: 5,
        showTicks: true,
      });

      return {
        data,
      };
    },
  };
</script>
