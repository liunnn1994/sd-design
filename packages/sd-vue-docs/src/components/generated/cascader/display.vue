<template>
  <sd-space direction="vertical" size="large">
    <sd-cascader
      :options="options"
      default-value="datunli"
      class="sd:w-80"
      placeholder="显示完整路径"
      separator=" > "
    />
    <sd-cascader
      :options="options"
      default-value="datunli"
      class="sd:w-80"
      placeholder="仅显示叶子节点标签"
      :show-path="false"
    />
    <sd-cascader
      :options="options"
      :default-value="['chaoyang', 'haidian', 'dongcheng']"
      class="sd:w-80"
      placeholder="响应式标签"
      multiple
      allow-clear
      max-tag-count="responsive"
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
        },
        {
          value: 'dongcheng',
          label: '东城区',
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
