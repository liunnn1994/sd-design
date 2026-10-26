<template>
  <sd-form :model="form" auto-label-width>
    <sd-form-item label="尺寸">
      <sd-radio-group v-model="form.size" type="button" :options="sizeOptions" />
    </sd-form-item>

    <sd-form-item label="布局">
      <sd-radio-group v-model="form.layout" type="button" :options="layoutOptions" />
    </sd-form-item>

    <sd-form-item label="table-layout">
      <sd-radio-group v-model="form.tableLayout" type="button" :options="['auto', 'fixed']" />
    </sd-form-item>

    <sd-form-item label="列数">
      <sd-radio-group v-model="form.column" type="button" :options="columnOptions" />
    </sd-form-item>

    <sd-form-item label="firstSpan">
      <sd-radio-group v-model="form.firstSpan" type="button" :options="firstSpanOptions" />
    </sd-form-item>
  </sd-form>
  <div class="sd:mt-5">
    <sd-descriptions
      title="布局示例"
      :size="form.size"
      :column="form.column"
      :layout="form.layout"
      :table-layout="form.tableLayout"
      bordered
    >
      <sd-descriptions-item label="项目 1" :span="form.firstSpan">
        <div
          >跨列数：{{ form.firstSpan }}
          <span v-if="form.firstSpan > form.column" class="sd:text-[red]">
            超出列数时，按列数设置
          </span>
        </div>
      </sd-descriptions-item>
      <sd-descriptions-item label="项目 2" :span="2">跨列数：2</sd-descriptions-item>
      <sd-descriptions-item label="项目 3" :span="3">跨列数：3</sd-descriptions-item>
      <sd-descriptions-item label="项目 4" :span="2">跨列数：2</sd-descriptions-item>
      <sd-descriptions-item label="项目 5" :span="1">跨列数：1</sd-descriptions-item>
      <sd-descriptions-item label="项目 6" :span="1">跨列数：1</sd-descriptions-item>
    </sd-descriptions>
  </div>
</template>

<script setup lang="ts">
  import type { DescLayout, Size } from '@sdata/web-vue';

  import { reactive } from 'vue';

  const form = reactive({
    size: 'medium' as Size,
    layout: 'horizontal' as DescLayout,
    column: 4,
    tableLayout: 'auto' as 'auto' | 'fixed',
    firstSpan: 2,
  });

  const layoutOptions: DescLayout[] = [
    'horizontal',
    'inline-horizontal',
    'vertical',
    'inline-vertical',
  ];
  const columnOptions = [1, 2, 3, 4, 5];
  const firstSpanOptions = [1, 2, 3, 4, 5];
  const sizeOptions: Size[] = ['mini', 'small', 'medium', 'large'];
</script>
