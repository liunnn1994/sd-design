```yaml
title:
  zh-CN: 配合表单使用
  en-US: With Form
```

## zh-CN

配合表单使用实现校验。

---

## en-US

Use with forms to implement verification.

---

```vue
<template>
  <sd-form ref="formRef" :model="form" style="width: 300px">
    <sd-form-item
      field="code"
      label="code"
      :rules="[
        { required: true, message: 'Verification code is required' },
        { minLength: 6, message: 'Verification code is incomplete' },
        { match: /^\d+$/, message: 'Must be numeric' },
      ]"
    >
      <sd-verification-code v-model="form.code" style="width: 300px" @finish="onFinish" />
    </sd-form-item>
    <sd-form-item>
      <sd-button style="width: 60px" type="primary" size="large" htmlType="submit">Submit</sd-button>
    </sd-form-item>
  </sd-form>
</template>

<script setup>
  import { ref } from 'vue';
  import { Message } from '@sdata/web-vue';

  const value = ref('654321');
  const formRef = ref(null);
  const form = ref({
    code: '',
  });
  const onFinish = (value) => Message.info(`Verification code: ${value}`);
</script>
```
