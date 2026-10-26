<template>
  <sd-form :model="form" class="sd:w-150">
    <sd-form-item
      label="用户名"
      :content-flex="false"
      :merge-props="false"
      extra="合并显示错误信息"
    >
      <sd-row :gutter="8">
        <sd-col :span="12">
          <sd-form-item
            field="together.firstname"
            validate-trigger="input"
            :rules="[{ required: true, message: '请输入名' }]"
            no-style
          >
            <sd-input v-model="form.together.firstname" placeholder="请输入名…" />
          </sd-form-item>
        </sd-col>
        <sd-col :span="12">
          <sd-form-item
            field="together.lastname"
            validate-trigger="input"
            :rules="[{ required: true, message: '请输入姓' }]"
            no-style
          >
            <sd-input v-model="form.together.lastname" placeholder="请输入姓…" />
          </sd-form-item>
        </sd-col>
      </sd-row>
    </sd-form-item>
    <sd-form-item label="用户名" :content-flex="false" :merge-props="false">
      <sd-row :gutter="8">
        <sd-col :span="12">
          <sd-form-item
            field="separate.firstname"
            validate-trigger="input"
            extra="分别显示错误信息"
            :rules="[{ required: true, message: '请输入名' }]"
            hide-label
          >
            <sd-input v-model="form.separate.firstname" placeholder="请输入名…" />
          </sd-form-item>
        </sd-col>
        <sd-col :span="12">
          <sd-form-item
            field="separate.lastname"
            validate-trigger="input"
            :rules="[{ required: true, message: '请输入姓' }]"
            hide-label
          >
            <sd-input v-model="form.separate.lastname" placeholder="请输入姓…" />
          </sd-form-item>
        </sd-col>
      </sd-row>
    </sd-form-item>
    <sd-form-item label="岗位" :content-flex="false" :merge-props="false">
      <sd-space direction="vertical" fill>
        <sd-form-item field="posts.post1" label="岗位 1">
          <sd-input v-model="form.posts.post1" placeholder="请输入岗位…" />
        </sd-form-item>
        <sd-form-item field="posts.post2" label="岗位 2">
          <sd-input v-model="form.posts.post2" placeholder="请输入岗位…" />
        </sd-form-item>
      </sd-space>
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
    together: {
      firstname: '',
      lastname: '',
    },
    separate: {
      firstname: '',
      lastname: '',
    },
    posts: {
      post1: '',
      post2: '',
    },
    isRead: false,
  });
</script>
