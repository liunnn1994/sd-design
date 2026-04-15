<template>
  <sd-space direction="vertical" :style="{ width: '50%' }">
    <sd-progress :percent="percent" />
    <sd-progress status="warning" :percent="percent" />
    <sd-progress status="danger" :percent="percent" />
  </sd-space>
  <div :style="{ marginTop: '20px' }">
    <sd-slider v-model="percent" :max="1" :step="0.1" :style="{ width: '150px' }" />
  </div>
</template>

<script>
  import { ref } from 'vue';

  export default {
    setup() {
      const percent = ref(0.2);

      return {
        percent,
      };
    },
  };
</script>
