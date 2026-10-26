<template>
  <sd-form ref="formRef" :size="form.size" :model="form" class="sd:w-150" @submit="handleSubmit">
    <sd-form-item field="size" label="表单尺寸">
      <sd-radio-group v-model="form.size" type="button">
        <sd-radio value="mini">迷你</sd-radio>
        <sd-radio value="small">小</sd-radio>
        <sd-radio value="medium">中</sd-radio>
        <sd-radio value="large">大</sd-radio>
      </sd-radio-group>
    </sd-form-item>
    <sd-form-item
      field="name"
      label="用户名"
      :rules="[
        { required: true, message: '请输入姓名' },
        { minLength: 5, message: '长度必须大于 5 个字符' },
      ]"
      :validate-trigger="['change', 'input']"
    >
      <sd-input v-model="form.name" placeholder="请输入用户名…" />
    </sd-form-item>
    <sd-form-item
      field="age"
      label="年龄"
      :rules="[
        { required: true, message: '请输入年龄' },
        { type: 'number', max: 200, message: '年龄不能超过 200 岁' },
      ]"
    >
      <sd-input-number v-model="form.age" placeholder="请输入年龄…" />
    </sd-form-item>
    <sd-form-item
      field="section"
      label="区块"
      :rules="[{ match: /section one/, message: '请选择一项' }]"
    >
      <sd-select
        v-model="form.section"
        placeholder="请选择…"
        allow-clear
        :options="sectionOptions"
      />
    </sd-form-item>
    <sd-form-item
      field="province"
      label="省份"
      :rules="[{ required: true, message: '请选择省份' }]"
    >
      <sd-cascader v-model="form.province" :options="options" placeholder="请选择…" allow-clear />
    </sd-form-item>
    <sd-form-item
      field="options"
      label="选项"
      :rules="[{ type: 'array', minLength: 2, message: '请选择至少三个选项' }]"
    >
      <sd-checkbox-group v-model="form.options">
        <sd-checkbox value="option one">第一区块</sd-checkbox>
        <sd-checkbox value="option two">选项二</sd-checkbox>
        <sd-checkbox value="option three">选项三</sd-checkbox>
        <sd-checkbox value="option four">选项四</sd-checkbox>
      </sd-checkbox-group>
    </sd-form-item>
    <sd-form-item field="date" label="日期">
      <sd-date-picker v-model="form.date" placeholder="请选择…" />
    </sd-form-item>
    <sd-form-item field="time" label="时间">
      <sd-time-picker v-model="form.time" placeholder="请选择…" />
    </sd-form-item>
    <sd-form-item field="radio" label="单选框" :rules="[{ match: /one/, message: '请选择一项' }]">
      <sd-radio-group v-model="form.radio">
        <sd-radio value="单选项一">单选项一</sd-radio>
        <sd-radio value="radio two">单选项二</sd-radio>
      </sd-radio-group>
    </sd-form-item>
    <sd-form-item
      field="slider"
      label="滑动输入条"
      :rules="[{ type: 'number', min: 5, message: '滑动输入值不能小于 5' }]"
    >
      <sd-slider v-model="form.slider" :max="10" />
    </sd-form-item>
    <sd-form-item field="score" label="得分">
      <sd-rate v-model="form.score" allow-clear />
    </sd-form-item>
    <sd-form-item
      field="switch"
      label="开关"
      :rules="[{ type: 'boolean', true: true, message: '必须勾选' }]"
    >
      <sd-switch v-model="form.switch" />
    </sd-form-item>
    <sd-form-item field="multiSelect" label="多选">
      <sd-select
        v-model="form.multiSelect"
        placeholder="请选择…"
        multiple
        :options="sectionOptions"
      />
    </sd-form-item>
    <sd-form-item field="treeSelect" label="树选择器">
      <sd-tree-select :data="treeData" v-model="form.treeSelect" placeholder="请选择…" />
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
  import type { FormInstance, Size, ValidatedError } from '@sdata/web-vue';

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
    size: 'medium' as Size,
    name: '',
    age: undefined,
    section: '',
    province: 'haidian',
    options: [],
    date: '',
    time: '',
    radio: '单选项一',
    slider: 5,
    score: 5,
    switch: false,
    multiSelect: ['第一区块'],
    treeSelect: '',
  });
  const options = [
    {
      value: 'beijing',
      label: '北京',
      children: [
        {
          value: 'chaoyang',
          label: '朝阳区',
          children: [
            {
              value: 'datunli',
              label: '大屯里',
            },
          ],
        },
        {
          value: 'haidian',
          label: '海淀区',
        },
        {
          value: 'dongcheng',
          label: '东城区',
        },
        {
          value: 'xicheng',
          label: '西城区',
        },
      ],
    },
    {
      value: 'shanghai',
      label: '上海',
      children: [
        {
          value: 'shanghaishi',
          label: '上海',
          children: [
            {
              value: 'huangpu',
              label: '黄浦区',
            },
          ],
        },
      ],
    },
  ];
  const treeData = [
    {
      key: 'node1',
      title: '节点 1',
      children: [
        {
          key: 'node2',
          title: '节点 2',
        },
      ],
    },
    {
      key: 'node3',
      title: '节点 3',
      children: [
        {
          key: 'node4',
          title: '节点 4',
        },
        {
          key: 'node5',
          title: '节点 5',
        },
      ],
    },
  ];

  const sectionOptions = [
    { value: '第一区块', label: '第一区块' },
    { value: '第二区块', label: '第二区块' },
    { value: '第三区块', label: '第三区块' },
  ];
  const formRef = ref<FormInstance | null>(null);
</script>
