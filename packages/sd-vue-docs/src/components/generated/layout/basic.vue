<template>
  <div class="layout-basic-demo">
    <sd-layout class="layout-basic-item">
      <sd-layout-header>Header</sd-layout-header>
      <sd-layout-content>Content</sd-layout-content>
      <sd-layout-footer>Footer</sd-layout-footer>
    </sd-layout>

    <sd-layout class="layout-basic-item">
      <sd-layout-header>Header</sd-layout-header>
      <sd-layout>
        <sd-layout-sider width="25%">Sider</sd-layout-sider>
        <sd-layout-content>Content</sd-layout-content>
      </sd-layout>
      <sd-layout-footer>Footer</sd-layout-footer>
    </sd-layout>

    <sd-layout class="layout-basic-item">
      <sd-layout-header>Header</sd-layout-header>
      <sd-layout>
        <sd-layout-content>Content</sd-layout-content>
        <sd-layout-sider width="25%">Sider</sd-layout-sider>
      </sd-layout>
      <sd-layout-footer>Footer</sd-layout-footer>
    </sd-layout>

    <sd-layout class="layout-basic-item">
      <sd-layout-sider width="25%">Sider</sd-layout-sider>
      <sd-layout>
        <sd-layout-header>Header</sd-layout-header>
        <sd-layout-content>Content</sd-layout-content>
        <sd-layout-footer>Footer</sd-layout-footer>
      </sd-layout>
    </sd-layout>
  </div>
</template>

<style scoped>
  .layout-basic-demo {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
  }

  .layout-basic-item {
    width: calc(50% - 8px);
    max-width: calc(50% - 8px);
    overflow: hidden;
    border-radius: 8px;
  }

  .layout-basic-item :deep(.sd-layout-header) {
    height: 64px;
    padding-inline: 48px;
    line-height: 64px;
    color: #fff;
    text-align: center;
    background: #4096ff;
  }

  .layout-basic-item :deep(.sd-layout-content) {
    min-height: 120px;
    line-height: 120px;
    color: #fff;
    text-align: center;
    background: #0958d9;
  }

  .layout-basic-item :deep(.sd-layout-sider) {
    line-height: 120px;
    color: #fff;
    text-align: center;
    background: #1677ff;
  }

  .layout-basic-item :deep(.sd-layout-footer) {
    color: #fff;
    text-align: center;
    background: #4096ff;
  }
</style>
