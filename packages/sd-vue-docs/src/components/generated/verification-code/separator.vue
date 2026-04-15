<template>
  <sd-verification-code
    style="width: 400px"
    :length="9"
    :separator="(index) => ((index + 1) % 3 || index > 7 ? null : '-')"
    @finish="(value) => Message.info(`Verification code: ${value}`)"
  />
</template>

<script setup>
  import { Message } from '@sdata/web-vue';
</script>
