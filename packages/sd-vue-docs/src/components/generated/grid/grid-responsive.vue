<template>
  <sd-grid
    :cols="{ xs: 1, sm: 2, md: 3, lg: 4, xl: 5, xxl: 6 }"
    :colGap="12"
    :rowGap="16"
    class="grid-demo-grid sd:text-white"
  >
    <sd-grid-item class="demo-item sd:bg-[#4096ff]">item</sd-grid-item>
    <sd-grid-item class="demo-item sd:bg-[#0958d9]">item</sd-grid-item>
    <sd-grid-item class="demo-item sd:bg-[#4096ff]">item</sd-grid-item>
    <sd-grid-item class="demo-item sd:bg-[#0958d9]">item</sd-grid-item>
    <sd-grid-item class="demo-item sd:bg-[#4096ff]">item</sd-grid-item>
    <sd-grid-item class="demo-item sd:bg-[#0958d9]">item</sd-grid-item>
    <sd-grid-item class="demo-item sd:bg-[#4096ff]" :span="{ xl: 4, xxl: 6 }" suffix>
      suffix
    </sd-grid-item>
  </sd-grid>
</template>

<style scoped>
  .grid-demo-grid .demo-item,
  .grid-demo-grid .demo-suffix {
    height: 48px;
    line-height: 48px;
    text-align: center;
  }
</style>
