<template>
  <sd-space direction="vertical" size="large">
    <sd-radio-group v-model="status" type="button">
      <sd-radio value="validating">校验中</sd-radio>
      <sd-radio value="success">成功</sd-radio>
      <sd-radio value="error">错误</sd-radio>
      <sd-radio value="warning">警告</sd-radio>
    </sd-radio-group>
    <sd-radio-group v-model="size" type="button">
      <sd-radio value="mini">迷你</sd-radio>
      <sd-radio value="small">小</sd-radio>
      <sd-radio value="medium">中</sd-radio>
      <sd-radio value="large">大</sd-radio>
    </sd-radio-group>
  </sd-space>
  <sd-form :model="form" class="sd:w-150 sd:mt-5" :size="size">
    <sd-form-item
      field="name"
      label="用户名"
      help="这是自定义提示"
      extra="这是补充说明"
      :validate-status="status"
      feedback
    >
      <sd-input v-model="form.name" placeholder="请输入用户名…" />
    </sd-form-item>
    <sd-form-item
      field="post"
      label="岗位"
      help="这是自定义提示"
      extra="这是补充说明"
      :validate-status="status"
      feedback
    >
      <sd-input-number v-model="form.post" placeholder="请输入岗位…" />
    </sd-form-item>
    <sd-form-item
      field="tags"
      label="标签"
      help="这是自定义提示"
      extra="这是补充说明"
      :validate-status="status"
      feedback
    >
      <sd-input-tag v-model="form.tags" placeholder="请输入岗位…" />
    </sd-form-item>
    <sd-form-item
      field="section"
      label="区块"
      :rules="[{ match: /section one/, message: '请选择一项' }]"
      :validate-status="status"
      feedback
    >
      <sd-select v-model="form.section" placeholder="请选择…" :options="sectionOptions" />
    </sd-form-item>
    <sd-form-item label="日期范围" :validate-status="status" feedback>
      <sd-range-picker></sd-range-picker>
    </sd-form-item>

    <sd-form-item field="date" label="日期" :validate-status="status" feedback>
      <sd-date-picker></sd-date-picker>
    </sd-form-item>

    <sd-form-item field="time" label="时间" :validate-status="status" feedback>
      <sd-time-picker></sd-time-picker>
    </sd-form-item>
  </sd-form>
</template>

<script setup lang="ts">
  import type { Size, ValidateStatus } from '@sdata/web-vue';

  import { reactive, ref } from 'vue';

  const status = ref<ValidateStatus>('success');
  const size = ref<Size>('medium');
  const form = reactive({
    name: '',
    post: undefined,
    tags: ['tag1'],
    section: '',
  });
  const sectionOptions = [
    { value: '第一区块', label: '第一区块' },
    { value: '第二区块', label: '第二区块' },
    { value: '第三区块', label: '第三区块' },
  ];
</script>
