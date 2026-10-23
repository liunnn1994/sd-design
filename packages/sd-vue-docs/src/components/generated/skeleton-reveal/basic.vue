<script setup lang="ts">
  import { Button, Input, SkeletonReveal } from '@sdata/web-vue';
</script>
<template>
  <SkeletonReveal
    ><div
      class="reveal-demo"
      style="
        display: grid;
        gap: 16px;
        padding: 24px;
        border: 1px solid var(--sd-color-border-2);
        border-radius: 8px;
      "
      ><h3 style="margin: 0">创建你的项目</h3><Input placeholder="项目名称" /><Button type="primary"
        >创建项目</Button
      ></div
    ></SkeletonReveal
  >
</template>
