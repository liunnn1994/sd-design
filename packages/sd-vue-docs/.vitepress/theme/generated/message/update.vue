<template>
  <a-button @click="handleClick">Update Info Message</a-button>
</template>

<script>
  export default {
    data() {
      return {
        index: 0,
      };
    },
    methods: {
      handleClick() {
        this.$message.info({
          id: 'myInfo',
          content: `This is an info message ${this.$data.index++}`,
          duration: 2000,
        });
      },
    },
  };
</script>
