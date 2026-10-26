<template>
  <sd-form ref="formRef" :model="form" class="sd:w-150">
    <sd-form-item field="name" label="用户名" :rules="rules">
      <sd-input v-model="form.name" placeholder="请输入用户名…" />
    </sd-form-item>
    <sd-form-item field="post" label="岗位">
      <sd-input v-model="form.post" placeholder="请输入岗位…" />
    </sd-form-item>
    <sd-form-item field="isRead">
      <sd-checkbox v-model="form.isRead"> 我已阅读使用手册 </sd-checkbox>
    </sd-form-item>
    <sd-form-item>
      <sd-button @click="handleClick">设置状态</sd-button>
    </sd-form-item>
  </sd-form>
  {{ form }}
</template>

<script setup lang="ts">
  import type { FieldRule, FormInstance } from '@sdata/web-vue';

  import { reactive, ref } from 'vue';

  const formRef = ref<FormInstance | null>(null);
  const form = reactive({
    name: '',
    post: '',
    isRead: false,
  });
  const rules: FieldRule[] = [
    {
      validator: (value: unknown, cb: (error?: string) => void) => {
        return new Promise<void>((resolve) => {
          window.setTimeout(() => {
            if (value !== 'admin') {
              cb('用户名必须为 admin');
            }
            resolve();
          }, 2000);
        });
      },
    },
  ];
  const handleClick = () => {
    formRef.value?.setFields({
      name: {
        status: 'error',
        message: '姓名异步校验失败',
      },
      post: {
        status: 'error',
        message: '有效岗位',
      },
    });
  };
</script>
