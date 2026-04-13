<template>
  <a-auto-complete
    :data="data"
    :style="{ width: '360px' }"
    placeholder="please enter something"
    strict
  />
</template>

<script>
  export default {
    data() {
      return {
        data: ['Beijing', 'Shanghai', 'Chengdu', 'WuHan'],
      };
    },
  };
</script>
