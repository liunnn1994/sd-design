<template>
  <a-auto-complete
    :data="data"
    :style="{ width: '360px' }"
    placeholder="please enter something"
    @dropdown-scroll="handleScroll"
    @dropdown-reach-bottom="handleReachBottom"
  />
</template>

<script>
  import { ref } from 'vue';

  export default {
    setup() {
      const data = ref([...Array(100)].map((_, index) => `option-${index}`));

      const handleScroll = (ev) => {
        console.log('scroll', ev);
      };
      const handleReachBottom = (ev) => {
        console.log('reach the bottom', ev);
      };

      return {
        data,
        handleScroll,
        handleReachBottom,
      };
    },
  };
</script>
