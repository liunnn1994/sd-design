<template>
  <a-space size="large">
    <a-progress type="circle" :percent="percent" />
    <a-progress type="circle" status="warning" :percent="percent" />
    <a-progress type="circle" status="danger" :percent="percent" />
    <a-progress type="circle" status="success" :percent="percent" />
  </a-space>
  <div :style="{ marginTop: '20px' }">
    <a-slider v-model="percent" :max="1" :step="0.1" :style="{ width: '150px' }" />
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
