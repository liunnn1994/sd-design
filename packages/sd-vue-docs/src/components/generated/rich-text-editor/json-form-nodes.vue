<template>
  <div class="demo">
    <Space wrap>
      <Select v-model="selectedName" :options="options" class="node-select" />
      <Button type="primary" @click="insertSelectedNode">插入节点</Button>
    </Space>
    <RichTextEditor
      ref="editorRef"
      default-value="JsonForm 的全部内置节点都可以插入到文档中："
      :auto-size="{ minRows: 5, maxRows: 10 }"
    />
  </div>
</template>

<script setup lang="ts">
  import type {
    RichTextEditorComponentNodeData,
    RichTextEditorInstance,
    RichTextEditorJsonFormNodeName,
  } from '@sdata/web-vue';

  import { computed, shallowRef } from 'vue';

  import {
    Button,
    RichTextEditor,
    RICH_TEXT_EDITOR_JSON_FORM_NODE_NAMES,
    Select,
    Space,
  } from '@sdata/web-vue';

  const editorRef = shallowRef<RichTextEditorInstance>();
  const selectedName = shallowRef<RichTextEditorJsonFormNodeName>('inputNumber');
  let sequence = 0;

  const labels: Record<RichTextEditorJsonFormNodeName, string> = {
    autoComplete: '自动补全 AutoComplete',
    cascader: '级联选择 Cascader',
    checkbox: '复选框 Checkbox',
    checkboxGroup: '复选框组 CheckboxGroup',
    datePicker: '日期选择 DatePicker',
    input: '输入框 Input',
    inputNumber: '数字输入 InputNumber',
    inputPassword: '密码输入 InputPassword',
    inputSearch: '搜索输入 InputSearch',
    inputTag: '标签输入 InputTag',
    mention: '提及 Mention',
    noFormItem: '无表单项内容 NoFormItem',
    radio: '单选框 Radio',
    radioGroup: '单选框组 RadioGroup',
    rangePicker: '日期范围 RangePicker',
    rate: '评分 Rate',
    row: '栅格行 Row',
    select: '选择器 Select',
    slider: '滑块 Slider',
    switch: '开关 Switch',
    textarea: '文本域 Textarea',
    timePicker: '时间选择 TimePicker',
    transfer: '穿梭框 Transfer',
    treeSelect: '树选择 TreeSelect',
    verificationCode: '验证码 VerificationCode',
  };

  const options = computed(() =>
    RICH_TEXT_EDITOR_JSON_FORM_NODE_NAMES.map((name) => ({
      label: labels[name],
      value: name,
    })),
  );

  const sampleNodes: Partial<
    Record<RichTextEditorJsonFormNodeName, Partial<RichTextEditorComponentNodeData>>
  > = {
    autoComplete: { value: 'Vue', props: { data: ['Vue', 'React', 'TypeScript'] } },
    cascader: {
      value: ['frontend', 'vue'],
      props: {
        options: [
          {
            value: 'frontend',
            label: '前端框架',
            children: [
              { value: 'vue', label: 'Vue' },
              { value: 'react', label: 'React' },
            ],
          },
          {
            value: 'language',
            label: '开发语言',
            children: [
              { value: 'typescript', label: 'TypeScript' },
              { value: 'javascript', label: 'JavaScript' },
            ],
          },
        ],
      },
    },
    checkbox: { value: true, props: { label: '已勾选' } },
    checkboxGroup: { value: ['Vue'], props: { options: ['Vue', 'React'] } },
    datePicker: {
      value: '2026-07-26',
      props: { valueFormat: 'YYYY-MM-DD' },
    },
    input: { value: '文本' },
    inputNumber: { value: 8 },
    inputPassword: { value: 'password' },
    inputSearch: { value: '关键词' },
    inputTag: { value: ['Vue', 'TypeScript'], props: { placeholder: '输入标签后回车' } },
    mention: { value: '@Vue', props: { data: ['Vue', 'TypeScript'] } },
    noFormItem: { value: '无表单项内容' },
    radio: { value: true, props: { label: '单选项' } },
    radioGroup: { value: 'Vue', props: { options: ['Vue', 'React'] } },
    rangePicker: {
      value: ['2026-07-20', '2026-07-26'],
      props: {
        valueFormat: 'YYYY-MM-DD',
        placeholder: ['开始日期', '结束日期'],
      },
    },
    rate: { value: 3 },
    row: { value: 'Row 内容' },
    select: { value: 'Vue', props: { options: ['Vue', 'React', 'TypeScript'] } },
    slider: { value: 40 },
    switch: { value: true },
    textarea: { value: '多行文本' },
    timePicker: {
      value: '09:30:00',
      props: { format: 'HH:mm:ss', placeholder: '选择时间' },
    },
    transfer: {
      value: ['vue', 'typescript'],
      props: {
        data: [
          { value: 'vue', label: 'Vue' },
          { value: 'react', label: 'React' },
          { value: 'typescript', label: 'TypeScript' },
          { value: 'javascript', label: 'JavaScript' },
        ],
      },
    },
    treeSelect: {
      value: 'vue',
      props: {
        data: [
          {
            key: 'frontend',
            title: '前端框架',
            children: [
              { key: 'vue', title: 'Vue' },
              { key: 'react', title: 'React' },
            ],
          },
          {
            key: 'language',
            title: '开发语言',
            children: [
              { key: 'typescript', title: 'TypeScript' },
              { key: 'javascript', title: 'JavaScript' },
            ],
          },
        ],
        placeholder: '选择技术栈',
      },
    },
    verificationCode: { value: '1234' },
  };

  const insertSelectedNode = () => {
    const name = selectedName.value;
    const sample = sampleNodes[name] ?? { value: null };
    editorRef.value?.insertComponent({
      key: `${name}-${++sequence}`,
      name,
      value: sample.value,
      props: sample.props,
      textValue: labels[name],
    });
  };
</script>

<style scoped>
  .demo {
    display: grid;
    gap: 12px;
  }

  .node-select {
    width: 240px;
  }
</style>
