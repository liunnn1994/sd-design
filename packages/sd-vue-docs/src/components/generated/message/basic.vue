<template>
  <sd-button @click="handleClick">Info Message</sd-button>
</template>

<script>
  export default {
    methods: {
      handleClick() {
        this.$message.info('This is an info message');
      },
    },
  };
</script>
