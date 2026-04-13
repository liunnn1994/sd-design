<template>
  <a-verification-code v-model="value" style="width: 300px" @finish="onFinish" />
</template>

<script setup>
import { ref } from 'vue';
import { Message} from '@sd-design/web-vue';

const value = ref('654321');
const onFinish = (value) => Message.info(`Verification code: ${value}`);
</script>
