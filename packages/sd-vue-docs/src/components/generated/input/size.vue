<template>
  <sd-space direction="vertical" size="large">
    <sd-radio-group type="button" v-model="size">
      <sd-radio value="mini">mini</sd-radio>
      <sd-radio value="small">small</sd-radio>
      <sd-radio value="medium">medium</sd-radio>
      <sd-radio value="large">large</sd-radio>
    </sd-radio-group>
    <sd-input
      :style="{ width: '320px' }"
      placeholder="Please enter something"
      :size="size"
      allow-clear
    />
  </sd-space>
</template>

<script>
  import { ref } from 'vue';

  export default {
    setup() {
      const size = ref('medium');

      return {
        size,
      };
    },
  };
</script>
