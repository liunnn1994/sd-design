<script setup lang="ts">
  import { ref } from 'vue';

  const formModel = ref({ keyword: '' });
  const formSchemas = [
    {
      field: 'keyword',
      label: '配置式表单',
      type: 'input',
      componentProps: {
        fitWidth: true,
        placeholder: '按字段配置',
      },
    },
  ];
  const options = ['短选项', '宽度随当前选项变化'];
</script>

<template>
  <div class="fit-width-demo">
    <section>
      <h4>输入类</h4>
      <div class="fit-width-demo-grid">
        <label>输入框</label>
        <sd-input fit-width placeholder="输入内容" />
        <label>数字输入框</label>
        <sd-input-number fit-width />
        <label>密码输入框</label>
        <sd-input-password fit-width default-value="secret" />
        <label>搜索输入框</label>
        <sd-input-search fit-width placeholder="搜索" />
        <label>标签输入框</label>
        <sd-input-tag fit-width :default-value="['标签']" />
        <label>多行文本框</label>
        <sd-textarea fit-width default-value="可随最长一行变化" />
        <label>自动补全</label>
        <sd-auto-complete fit-width placeholder="自动补全" :data="options" />
        <label>提及</label>
        <sd-mention fit-width placeholder="输入 @ 提及" :data="options" />
      </div>
    </section>

    <section>
      <h4>选择类</h4>
      <div class="fit-width-demo-grid">
        <label>选择框</label>
        <sd-select fit-width default-value="短选项" :options="options" />
        <label>级联选择</label>
        <sd-cascader
          fit-width
          default-value="leaf"
          :options="[{ value: 'leaf', label: '级联选项' }]"
        />
        <label>树选择器</label>
        <sd-tree-select
          fit-width
          default-value="leaf"
          :data="[{ key: 'leaf', title: '树选择项' }]"
        />
      </div>
    </section>

    <section>
      <h4>日期与时间</h4>
      <div class="fit-width-demo-grid">
        <label>日期选择器</label>
        <sd-date-picker fit-width default-value="2026-07-26" />
        <label>范围选择器</label>
        <sd-range-picker fit-width :default-value="['2026-07-01', '2026-07-26']" />
        <label>时间选择器</label>
        <sd-time-picker fit-width default-value="12:34:56" />
      </div>
    </section>

    <section>
      <h4>容器限制与 JsonForm</h4>
      <div class="fit-width-demo-limit">
        <sd-input
          fit-width
          default-value="max-w-full 默认为 true，因此内容很长时不会撑破这个容器"
        />
      </div>
      <sd-json-form v-model="formModel" :schemas="formSchemas" layout="vertical" />
    </section>
  </div>
</template>

<style>
  .fit-width-demo {
    display: grid;
    gap: 20px;
  }

  .fit-width-demo h4 {
    margin: 0 0 12px;
  }

  .fit-width-demo-grid {
    display: grid;
    grid-template-columns: 112px minmax(0, 1fr);
    gap: 12px;
    align-items: center;
  }

  .fit-width-demo-grid > label {
    color: var(--sd-color-text-2);
    font-size: 13px;
  }

  .fit-width-demo-limit {
    box-sizing: border-box;
    width: 240px;
    margin-bottom: 16px;
    padding: 8px;
    border: 1px dashed var(--sd-color-border-2);
  }
</style>
