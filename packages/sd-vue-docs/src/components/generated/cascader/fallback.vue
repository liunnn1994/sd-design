<template>
  <sd-space direction="vertical" size="large">
    <sd-cascader
      :options="options"
      v-model="value"
      class="sd:w-80"
      placeholder="请选择…"
      multiple
    />
    <sd-cascader
      :options="options"
      v-model="value2"
      class="sd:w-80"
      placeholder="请选择…"
      path-mode
      multiple
      :fallback="fallback"
    />
  </sd-space>
</template>

<script setup lang="ts">
  import type { CascaderFallback, CascaderOption } from '@sdata/web-vue';

  import { ref } from 'vue';

  const value = ref(['datunli', 'wuhou']);
  const value2 = ref([
    ['beijing', 'chaoyang', 'datunli'],
    ['sichuan', 'chengdu', 'wuhou'],
  ]);
  const fallback: CascaderFallback = (value) => {
    return (Array.isArray(value) ? value : [value])
      .map((item) => String(item).toUpperCase())
      .join('-');
  };

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
</script>
