<template>
  <a-button @click="handleClick">Closeable Message</a-button>
</template>

<script>
export default {
  methods: {
    handleClick(){
      this.$message.info({
        content:'This is an info message!',
        closable: true
      })
    }
  }
};
</script>
