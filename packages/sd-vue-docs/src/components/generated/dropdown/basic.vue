<template>
  <sd-space size="large">
    <sd-dropdown @select="handleSelect">
      <sd-button>点击我</sd-button>
      <template #content>
        <sd-doption>选项 1</sd-doption>
        <sd-doption disabled>选项 2</sd-doption>
        <sd-doption :value="{ value: '选项 3' }">选项 3</sd-doption>
      </template>
    </sd-dropdown>
    <sd-dropdown @select="handleSelect" disabled>
      <sd-button disabled>点击我</sd-button>
      <template #content>
        <sd-doption>选项 1</sd-doption>
        <sd-doption disabled>选项 2</sd-doption>
        <sd-doption>选项 3</sd-doption>
      </template>
    </sd-dropdown>
    <sd-dropdown @select="handleSelect" :popup-max-height="false">
      <sd-button>不限制最大高度 <icon-down /></sd-button>
      <template #content>
        <sd-doption>选项 1</sd-doption>
        <sd-doption disabled>选项 2</sd-doption>
        <sd-doption>选项 3</sd-doption>
        <sd-doption>选项 4</sd-doption>
        <sd-doption>选项 5</sd-doption>
        <sd-doption>选项 6</sd-doption>
        <sd-doption>选项 7</sd-doption>
        <sd-doption>选项 8</sd-doption>
        <sd-doption>选项 9</sd-doption>
      </template>
    </sd-dropdown>
  </sd-space>
</template>

<script setup lang="ts">
  const handleSelect = (
    v: string | number | Record<string, unknown> | undefined,
    _event: Event,
  ) => {
    console.log(v);
  };
</script>

<style>
  .sd-dropdown-open .sd-icon-down {
    transform: rotate(180deg);
  }
</style>
