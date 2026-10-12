<template>
  <sd-verification-code
    class="sd:w-100"
    :length="9"
    :separator="(index) => ((index + 1) % 3 || index > 7 ? h('span') : h('span', '-'))"
    @finish="handleFinish"
  />
</template>

<script setup lang="ts">
  import { h } from 'vue';

  import { Message } from '@sdata/web-vue';

  const handleFinish = (value: string) => Message.info(`Verification code: ${value}`);
</script>
