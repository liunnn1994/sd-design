<template>
  <sd-grid
    :cols="{ xs: 1, sm: 2, md: 3, lg: 4, xl: 5, xxl: 6 }"
    :colGap="12"
    :rowGap="16"
    class="grid-demo-grid"
  >
    <sd-grid-item class="demo-item">item</sd-grid-item>
    <sd-grid-item class="demo-item">item</sd-grid-item>
    <sd-grid-item class="demo-item">item</sd-grid-item>
    <sd-grid-item class="demo-item">item</sd-grid-item>
    <sd-grid-item class="demo-item">item</sd-grid-item>
    <sd-grid-item class="demo-item">item</sd-grid-item>
    <sd-grid-item class="demo-item" :span="{ xl: 4, xxl: 6 }" suffix> suffix </sd-grid-item>
  </sd-grid>
</template>

<style scoped>
  .grid-demo-grid .demo-item,
  .grid-demo-grid .demo-suffix {
    height: 48px;
    color: var(--color-white);
    line-height: 48px;
    text-align: center;
  }

  .grid-demo-grid .demo-item:nth-child(2n) {
    background-color: rgb(var(--sdblue-6), 0.9);
  }

  .grid-demo-grid .demo-item:nth-child(2n + 1) {
    background-color: var(--color-primary-light-4);
  }
</style>
