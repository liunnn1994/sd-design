<template>
  <div style="height: 200px; overflow: auto" ref="containerRef">
    <div style="height: 400px; overflow: hidden; background: #ccc">
      <sd-affix :offsetTop="20" :target="containerRef" style="margin: 40px">
        <sd-button type="primary">Affix in scrolling container</sd-button>
      </sd-affix>
    </div>
  </div>
</template>

<script>
  import { ref } from 'vue';

  export default {
    setup() {
      const containerRef = ref();

      return {
        containerRef,
      };
    },
  };
</script>
