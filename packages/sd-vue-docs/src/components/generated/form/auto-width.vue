<template>
  <sd-form :model="form" class="sd:w-150" auto-label-width @submit="handleSubmit">
    <sd-form-item field="name" label="用户名">
      <sd-input v-model="form.name" placeholder="请输入用户名…" />
    </sd-form-item>
    <sd-form-item field="post" label="岗位">
      <sd-input v-model="form.post" placeholder="请输入岗位…" />
    </sd-form-item>
    <sd-form-item field="isRead">
      <sd-checkbox v-model="form.isRead"> 我已阅读使用手册 </sd-checkbox>
    </sd-form-item>
    <sd-form-item>
      <sd-button html-type="submit">提交</sd-button>
    </sd-form-item>
  </sd-form>
  {{ form }}
</template>

<script setup lang="ts">
  import type { ValidatedError } from '@sdata/web-vue';

  import { reactive } from 'vue';

  const form = reactive({
    name: '',
    post: '',
    isRead: false,
  });
  const handleSubmit = (data: {
    values: Record<string, unknown>;
    errors: Record<string, ValidatedError> | undefined;
  }) => {
    console.log(data);
  };
</script>
