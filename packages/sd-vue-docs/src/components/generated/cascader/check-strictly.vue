<template>
  <sd-space direction="vertical" size="large">
    <sd-cascader
      :options="options"
      default-value="beijing"
      class="sd:w-80"
      placeholder="请选择…"
      check-strictly
    />
    <sd-cascader
      :options="options"
      :default-value="['beijing']"
      class="sd:w-80"
      placeholder="请选择…"
      multiple
      check-strictly
    />
  </sd-space>
</template>

<script setup lang="ts">
  import type { CascaderOption } from '@sdata/web-vue';

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
          disabled: true,
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
</script>
