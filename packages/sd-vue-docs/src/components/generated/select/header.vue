<template>
  <sd-space>
    <sd-select
      :default-value="'北京'"
      class="sd:w-90"
      placeholder="请选择…"
      multiple
      :options="options"
    >
      <template #header>
        <div class="sd:py-1.5 sd:px-3">
          <sd-checkbox value="1">全选</sd-checkbox>
        </div>
      </template>
    </sd-select>

    <sd-select
      :default-value="'北京'"
      class="sd:w-90"
      placeholder="请选择…"
      multiple
      show-header-on-empty
      :options="options"
    >
      <template #header>
        <div class="sd:py-1.5 sd:px-3">
          <sd-checkbox value="1">全选</sd-checkbox>
        </div>
      </template>
    </sd-select>
  </sd-space>
</template>

<script setup lang="ts">
  const options = [
    '北京',
    '上海',
    '广州',
    { label: '禁用', value: '禁用', disabled: true },
    '深圳',
    '武汉',
  ];
</script>
