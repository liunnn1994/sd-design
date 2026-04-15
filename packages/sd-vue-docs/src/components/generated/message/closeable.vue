<template>
  <sd-button @click="handleClick">Closeable Message</sd-button>
</template>

<script>
  export default {
    methods: {
      handleClick() {
        this.$message.info({
          content: 'This is an info message!',
          closable: true,
        });
      },
    },
  };
</script>
