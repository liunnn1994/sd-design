<template>
  <sd-affix :offsetBottom="80" @change="onChange">
    <sd-button type="primary">80px to affix bottom</sd-button>
  </sd-affix>
</template>
<script>
  import { defineComponent } from 'vue';

  export default defineComponent({
    setup() {
      const onChange = (fixed) => {
        console.log(`${fixed}`);
      };
      return {
        onChange,
      };
    },
  });
</script>
