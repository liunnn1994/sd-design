<template>
  <div>
    <sd-button
      type="primary"
      @click="
        () => {
          timestamp = Date.now();
        }
      "
      style="margin-bottom: 20px"
    >
      reload
    </sd-button>
  </div>
  <sd-image
    width="200"
    height="200"
    :src="`https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/a8c8cdb109cb051163646151a4a5083b.png~tplv-uwbnlip3yd-webp.webp?timestamp=${timestamp}`"
  >
    <template #loader>
      <img
        width="200"
        src="https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/a8c8cdb109cb051163646151a4a5083b.png~tplv-uwbnlip3yd-webp.webp"
        style="filter: blur(5px)"
      />
    </template>
  </sd-image>
</template>

<script>
  import { ref } from 'vue';

  export default {
    setup() {
      const timestamp = ref('');
      return {
        timestamp,
      };
    },
  };
</script>
