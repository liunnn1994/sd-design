<template>
  <sd-form ref="formRef" :model="form" class="sd:w-75">
    <sd-form-item
      field="code"
      label="验证码"
      :rules="[
        { required: true, message: '请输入验证码' },
        { minLength: 6, message: '验证码不完整' },
        { match: /^\d+$/, message: '必须为数字' },
      ]"
    >
      <sd-verification-code v-model="form.code" class="sd:w-75" @finish="onFinish" />
    </sd-form-item>
    <sd-form-item>
      <sd-button type="primary" size="large" htmlType="submit">提交</sd-button>
    </sd-form-item>
  </sd-form>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  import { Message } from '@sdata/web-vue';

  const value = ref('654321');
  const formRef = ref(null);
  const form = ref({
    code: '',
  });
  const onFinish = (value: string) => Message.info(`验证码：${value}`);
</script>
