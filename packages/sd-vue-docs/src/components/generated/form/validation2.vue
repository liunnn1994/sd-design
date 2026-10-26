<template>
  <sd-form ref="formRef" :rules="rules" :model="form" class="sd:w-150" @submit="handleSubmit">
    <sd-form-item field="name" label="用户名" validate-trigger="blur">
      <sd-input v-model="form.name" placeholder="请输入用户名…" />
    </sd-form-item>
    <sd-form-item field="password" label="密码" validate-trigger="blur">
      <sd-input-password v-model="form.password" placeholder="请输入密码…" />
    </sd-form-item>
    <sd-form-item field="password2" label="确认密码" validate-trigger="blur">
      <sd-input-password v-model="form.password2" placeholder="请再次输入密码…" />
    </sd-form-item>
    <sd-form-item field="email" label="电子邮箱">
      <sd-input v-model="form.email" placeholder="请输入邮箱…" />
    </sd-form-item>
    <sd-form-item field="ip" label="IP">
      <sd-input v-model="form.ip" placeholder="请输入 IP 地址…" />
    </sd-form-item>
    <sd-form-item field="url" label="URL">
      <sd-input v-model="form.url" placeholder="请输入网址…" />
    </sd-form-item>
    <sd-form-item field="match" label="匹配">
      <sd-input v-model="form.match" placeholder="请输入匹配内容…" />
    </sd-form-item>
    <sd-form-item>
      <sd-space>
        <sd-button html-type="submit">提交</sd-button>
        <sd-button @click="formRef?.resetFields()">重置</sd-button>
      </sd-space>
    </sd-form-item>
  </sd-form>
  {{ form }}
</template>

<script setup lang="ts">
  import type { FieldRule, FormInstance, ValidatedError } from '@sdata/web-vue';

  import { reactive, ref } from 'vue';

  const handleSubmit = ({
    values,
    errors,
  }: {
    values: Record<string, unknown>;
    errors: Record<string, ValidatedError> | undefined;
  }) => {
    console.log('values:', values, '\nerrors:', errors);
  };

  const form = reactive({
    name: '',
    password: '',
    password2: '',
    email: '',
    ip: '192.168.2.1',
    url: '',
    match: '',
  });

  const rules: Record<string, FieldRule[]> = {
    name: [
      {
        required: true,
        message: '请输入姓名',
      },
    ],
    password: [
      {
        required: true,
        message: '请输入密码',
      },
    ],
    password2: [
      {
        required: true,
        message: '请输入密码',
      },
      {
        validator: (value: unknown, cb: (error?: string) => void) => {
          if (value !== form.password) {
            cb('两次输入的密码不一致');
          } else {
            cb();
          }
        },
      },
    ],
    email: [
      {
        type: 'email',
        required: true,
      },
    ],
    ip: [
      {
        type: 'ip',
        required: true,
      },
    ],
    url: [
      {
        type: 'url',
        required: true,
      },
    ],
    match: [
      {
        required: true,
        validator: (value: unknown, cb: (error?: string) => void) => {
          return new Promise<void>((resolve) => {
            if (!value) {
              cb('请输入匹配内容');
            }
            if (value !== 'match') {
              cb('内容必须为 match');
            }
            resolve();
          });
        },
      },
    ],
  };

  const formRef = ref<FormInstance | null>(null);
</script>
