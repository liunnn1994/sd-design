<template>
  <sd-space direction="vertical" size="large" class="sd:w-150">
    <sd-radio-group v-model="layout" type="button">
      <sd-radio value="horizontal">水平</sd-radio>
      <sd-radio value="vertical">垂直</sd-radio>
      <sd-radio value="inline">行内</sd-radio>
    </sd-radio-group>
    <sd-form :model="form" :layout="layout">
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
        <sd-button>提交</sd-button>
      </sd-form-item>
    </sd-form>
    <div>
      {{ form }}
    </div>
  </sd-space>
</template>

<script setup lang="ts">
  import { reactive, ref } from 'vue';

  const layout = ref<'horizontal' | 'vertical' | 'inline'>('horizontal');
  const form = reactive({
    name: '',
    post: '',
    isRead: false,
  });
</script>
