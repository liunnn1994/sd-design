<script setup lang="ts">
  import { ref } from 'vue';

  const value = ref('haidian');
  const options = [
    {
      value: 'beijing',
      label: '北京',
      children: [
        { value: 'chaoyang', label: '朝阳区' },
        { value: 'haidian', label: '海淀区' },
      ],
    },
    {
      value: 'shanghai',
      label: '上海',
      children: [{ value: 'pudong', label: '浦东新区' }],
    },
  ];
</script>

<template>
  <sd-cascader v-model="value" :options="options">
    <template #trigger="{ displayValue, selectedPaths, popupVisible }">
      <sd-button type="primary">
        {{ displayValue || '选择地区' }}
        （{{ selectedPaths[0]?.length ?? 0 }} 级，{{ popupVisible ? '收起' : '展开' }}）
      </sd-button>
    </template>
  </sd-cascader>
</template>
