<template>
  <a-space direction="vertical">
    <a-rate color="red" />
    <a-rate :color="color" />
  </a-space>
</template>

<script>
  export default {
    setup() {
      const color = {
        2: 'red',
        4: 'green',
        5: 'blue',
      };
      return {
        color,
      };
    },
  };
</script>
