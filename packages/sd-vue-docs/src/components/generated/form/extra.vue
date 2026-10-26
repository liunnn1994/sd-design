<template>
  <sd-form :model="form" class="sd:w-150">
    <sd-form-item field="name" label="用户名" validate-trigger="input" required>
      <sd-input v-model="form.name" placeholder="请输入用户名…" />
      <template #extra>
        <div>用于登录</div>
      </template>
    </sd-form-item>
    <sd-form-item field="post" label="岗位" validate-trigger="input" required>
      <sd-input v-model="form.post" placeholder="请输入岗位…" />
      <template #extra>
        <div>用于登录</div>
      </template>
      <template #help>
        <div>自定义校验提示</div>
      </template>
    </sd-form-item>
    <sd-form-item field="isRead">
      <sd-checkbox v-model="form.isRead"> 我已阅读使用手册 </sd-checkbox>
    </sd-form-item>
  </sd-form>
  {{ form }}
</template>

<script setup lang="ts">
  import { reactive } from 'vue';

  const form = reactive({
    name: '',
    post: '',
    isRead: false,
  });
</script>
