<template>
  <div class="sd:w-90">
    <sd-radio-group v-model="preset" type="button" class="sd:mb-3">
      <sd-radio value="default">默认固定行高</sd-radio>
      <sd-radio value="explicit">显式指定项尺寸</sd-radio>
    </sd-radio-group>

    <div class="sd:mb-3 sd:text-[var(--color-text-2)] sd:text-xs sd:leading-[1.5]">
      {{ helperText }}
    </div>

    <sd-cascader
      :options="options"
      class="sd:w-full"
      placeholder="请选择…"
      allow-search
      :trigger-props="{ popupStyle: { maxHeight: '220px' } }"
      :virtual-list-props="virtualListProps"
    />
  </div>
</template>

<script setup lang="ts">
  import type { CascaderOption } from '@sdata/web-vue';

  import { computed, ref } from 'vue';

  const preset = ref<'default' | 'explicit'>('default');

  const helperText = computed(() => {
    return preset.value === 'default'
      ? '第二级的大量选项使用级联选择器默认的固定行高虚拟滚动。'
      : '需要统一多个级联面板时，可显式设置 itemSize: 36。';
  });

  const virtualListProps = computed(() => {
    return preset.value === 'default' ? {} : { itemSize: 36, buffer: 260 };
  });

  const createLeafOptions = (prefix: string, count: number): CascaderOption[] => {
    return Array(count)
      .fill(null)
      .map((_, index) => ({
        value: `${prefix}-${index}`,
        label: `${prefix} 选项 ${index}`,
      }));
  };

  const options: CascaderOption[] = [
    {
      value: 'beijing',
      label: '北京',
      children: [
        {
          value: 'chaoyang',
          label: '朝阳区',
          children: createLeafOptions('朝阳区', 1200),
        },
        {
          value: 'haidian',
          label: '海淀区',
          children: createLeafOptions('海淀区', 800),
        },
      ],
    },
    {
      value: 'shanghai',
      label: '上海',
      children: [
        {
          value: 'pudong',
          label: '浦东新区',
          children: createLeafOptions('浦东新区', 1500),
        },
        {
          value: 'minhang',
          label: '闵行区',
          children: createLeafOptions('闵行区', 900),
        },
      ],
    },
  ];
</script>
