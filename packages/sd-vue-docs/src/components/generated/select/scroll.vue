<template>
  <sd-select
    class="sd:w-80"
    default-value="北京"
    placeholder="请选择…"
    :options="options"
    @dropdown-scroll="handleScroll"
    @dropdown-reach-bottom="handleReachBottom"
  />
</template>

<script setup lang="ts">
  const options = [
    '北京',
    '上海',
    '广州',
    { label: '禁用', value: '禁用', disabled: true },
    '深圳',
    '成都',
    '武汉',
  ];

  const handleScroll = (ev: Event) => {
    console.log('滚动', ev);
  };
  const handleReachBottom = (ev: Event) => {
    console.log('滚动到底部', ev);
  };
</script>
