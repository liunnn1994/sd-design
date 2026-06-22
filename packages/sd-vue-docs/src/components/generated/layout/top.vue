<template>
  <sd-layout class="layout-top-demo">
    <sd-layout-header>Header</sd-layout-header>
    <sd-layout-content>Content</sd-layout-content>
    <sd-layout-footer>Footer</sd-layout-footer>
  </sd-layout>
</template>

<style scoped>
  .layout-top-demo {
    border-radius: 8px;
    overflow: hidden;
  }

  .layout-top-demo :deep(.sd-layout-header) {
    height: 64px;
    padding-inline: 48px;
    line-height: 64px;
    color: #fff;
    text-align: center;
    background: #4096ff;
  }

  .layout-top-demo :deep(.sd-layout-content) {
    min-height: 120px;
    line-height: 120px;
    color: #fff;
    text-align: center;
    background: #0958d9;
  }

  .layout-top-demo :deep(.sd-layout-footer) {
    color: #fff;
    text-align: center;
    background: #4096ff;
  }
</style>
