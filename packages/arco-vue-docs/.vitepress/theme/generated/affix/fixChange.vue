<template>
  <a-affix
    :offsetBottom="80"
    @change="onChange"
  >
    <a-button type="primary">80px to affix bottom</a-button>
  </a-affix>
</template>
<script>
import { defineComponent } from 'vue';

export default defineComponent({
  setup() {
    const onChange = (fixed) => {
      console.log(`${fixed}`);
    };
    return {
      onChange
    };
  }
});
</script>
