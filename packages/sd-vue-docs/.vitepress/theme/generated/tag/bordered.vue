<template>
  <a-space wrap>
    <a-tag bordered>default</a-tag>
    <a-tag v-for="(color, index) of colors" :key="index" :color="color" bordered>{{ color }}</a-tag>
  </a-space>
</template>

<script>
  export default {
    setup() {
      const colors = [
        'orangered',
        'orange',
        'gold',
        'lime',
        'green',
        'cyan',
        'blue',
        'sdblue',
        'purple',
        'pinkpurple',
        'magenta',
        'gray',
      ];
      return {
        colors,
      };
    },
  };
</script>
