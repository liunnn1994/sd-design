<script setup lang="ts">
  import type { CascaderOption } from '@sdata/web-vue';

  const options: CascaderOption[] = [
    {
      value: 'standard',
      label: '标准 Ellipsis 会在文本溢出时展示完整文本提示',
      children: [
        {
          value: 'standard-child',
          label: '所有层级的选项文本都会保持左对齐并应用省略效果',
        },
      ],
    },
    {
      value: 'performant',
      label: 'Performant Ellipsis 适合大体量级联选项',
      children: [
        {
          value: 'performant-child',
          label: '高频渲染时减少文本测量开销',
        },
      ],
    },
  ];
</script>

<template>
  <sd-space direction="vertical" size="large">
    <div>
      <div class="sd:mb-2 sd:text-sm">默认 Ellipsis</div>
      <sd-cascader class="sd:w-64" :options="options" placeholder="请选择" />
    </div>

    <div>
      <div class="sd:mb-2 sd:text-sm">高性能 Ellipsis</div>
      <sd-cascader
        class="sd:w-64"
        :options="options"
        ellipsis="performant-ellipsis"
        placeholder="请选择"
      />
    </div>

    <div>
      <div class="sd:mb-2 sd:text-sm">关闭 Ellipsis</div>
      <sd-cascader class="sd:w-64" :ellipsis="false" :options="options" placeholder="请选择" />
    </div>
  </sd-space>
</template>
