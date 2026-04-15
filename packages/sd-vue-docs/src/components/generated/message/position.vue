<template>
  <sd-space>
    <sd-button @click="() => this.$message.info({ content: 'This is an info message!' })"
      >Top Message</sd-button
    >
    <sd-button
      @click="() => this.$message.info({ content: 'This is an info message!', position: 'bottom' })"
      >Bottom Message</sd-button
    >
  </sd-space>
</template>
