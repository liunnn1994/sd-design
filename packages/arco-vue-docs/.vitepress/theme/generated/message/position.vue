<template>
  <a-space>
    <a-button @click="()=>this.$message.info({content:'This is an info message!'})">Top Message</a-button>
    <a-button @click="()=>this.$message.info({content:'This is an info message!',position:'bottom'})">Bottom Message</a-button>
  </a-space>
</template>
