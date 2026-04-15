<template>
  <sd-space size="large">
    <sd-checkbox v-model="checked1">v-model</sd-checkbox>
    <sd-checkbox :model-value="true">binding value</sd-checkbox>
    <sd-checkbox :model-value="checked2">binding value2</sd-checkbox>
    <sd-checkbox :default-checked="true">uncontrolled state</sd-checkbox>
  </sd-space>
  <div :style="{ marginTop: '20px' }">
    <sd-button type="primary" @click="handleSetCheck">
      {{ checked2 ? 'uncheck' : 'check' }} value2
    </sd-button>
  </div>
</template>

<script>
  import { ref } from 'vue';

  export default {
    setup() {
      const checked1 = ref(false);
      const checked2 = ref(false);

      const handleSetCheck = () => {
        checked2.value = !checked2.value;
      };

      return {
        checked1,
        checked2,
        handleSetCheck,
      };
    },
  };
</script>
