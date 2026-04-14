<template>
  <a-verification-code defaultValue="123" style="width: 300px" masked @finish="onFinish" />
</template>

<script setup>
  import { Message } from '@sdata/web-vue';

  const onFinish = (value) => Message.info(`Verification code: ${value}`);
</script>
