<template>
  <sd-transfer
    show-search
    :data="data"
    :default-value="value"
    :source-input-search-props="{
      placeholder: '搜索源列表',
    }"
    :target-input-search-props="{
      placeholder: '搜索目标列表',
    }"
  />
</template>

<script setup lang="ts">
  const data = Array(8)
    .fill(undefined)
    .map((_, index) => ({
      value: `option${index + 1}`,
      label: `选项 ${index + 1}`,
    }));
  const value = ['option1', 'option3', 'option5'];
</script>
