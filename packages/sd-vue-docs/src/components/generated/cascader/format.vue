<template>
  <sd-cascader
    :options="options"
    default-value="datunli"
    class="sd:w-80"
    placeholder="请选择…"
    :format-label="format"
  />
</template>

<script setup lang="ts">
  import type { CascaderFormatLabel, CascaderOption } from '@sdata/web-vue';

  const options: CascaderOption[] = [
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
          children: [
            {
              value: 'jinrongjie',
              label: '金融街',
            },
            {
              value: 'tianqiao',
              label: '天桥',
            },
          ],
        },
      ],
    },
    {
      value: 'shanghai',
      label: '上海',
      children: [
        {
          value: 'huangpu',
          label: '黄浦区',
        },
      ],
    },
  ];

  const format: CascaderFormatLabel = (options) => {
    const labels = options.map((option) => option.label);
    return labels.join('-');
  };
</script>
