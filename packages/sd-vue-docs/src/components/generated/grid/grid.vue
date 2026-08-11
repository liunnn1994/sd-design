<template>
  <div class="sd:mb-5">
    <sd-typography-text>折叠：</sd-typography-text>
    <sd-switch :checked="collapsed" @click="collapsed = !collapsed" />
  </div>
  <sd-grid
    :cols="3"
    :colGap="12"
    :rowGap="16"
    class="grid-demo-grid sd:text-white"
    :collapsed="collapsed"
  >
    <sd-grid-item class="demo-item sd:bg-[#4096ff]">item</sd-grid-item>
    <sd-grid-item class="demo-item sd:bg-[#0958d9]">item</sd-grid-item>
    <sd-grid-item class="demo-item sd:bg-[#4096ff]">item</sd-grid-item>
    <sd-grid-item class="demo-item sd:bg-[#0958d9]" :offset="1">item | offset - 1</sd-grid-item>
    <sd-grid-item class="demo-item sd:bg-[#4096ff]">item</sd-grid-item>
    <sd-grid-item class="demo-item sd:bg-[#0958d9]" :span="3">item | span - 3</sd-grid-item>
    <sd-grid-item class="demo-item sd:bg-[#4096ff]">item</sd-grid-item>
    <sd-grid-item class="demo-item sd:bg-[#0958d9]">item</sd-grid-item>
    <sd-grid-item class="demo-item sd:bg-[#4096ff]" suffix #="{ overflow }">
      suffix | overflow: {{ overflow }}
    </sd-grid-item>
  </sd-grid>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const collapsed = ref(false);
</script>

<style scoped>
  .grid-demo-grid .demo-item,
  .grid-demo-grid .demo-suffix {
    height: 48px;
    line-height: 48px;
    text-align: center;
  }
</style>
