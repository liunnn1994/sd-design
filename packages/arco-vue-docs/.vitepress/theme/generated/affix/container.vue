<template>
  <div
    style="height: 200px; overflow: auto"
    ref="containerRef"
  >
    <div style="height: 400px; background: #cccccc; overflow: hidden">
      <a-affix
        :offsetTop="20"
        :target="containerRef"
        style="margin: 40px"
      >
        <a-button type="primary">Affix in scrolling container</a-button>
      </a-affix>
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
}
</script>
