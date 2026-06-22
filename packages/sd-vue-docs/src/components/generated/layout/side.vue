<template>
  <sd-layout class="layout-side-demo">
    <sd-layout-sider collapsible theme="dark">
      <template #header>
        <div class="logo" />
      </template>
      <sd-menu theme="dark" :default-selected-keys="['1']">
        <sd-menu-item key="1">
          <template #icon><icon-home /></template>
          <span>nav 1</span>
        </sd-menu-item>
        <sd-menu-item key="2">
          <template #icon><icon-user /></template>
          <span>nav 2</span>
        </sd-menu-item>
        <sd-menu-item key="3">
          <template #icon><icon-dashboard /></template>
          <span>nav 3</span>
        </sd-menu-item>
        <sd-menu-item key="4">
          <template #icon><icon-calendar /></template>
          <span>nav 4</span>
        </sd-menu-item>
        <sd-menu-item key="5">
          <template #icon><icon-email /></template>
          <span>nav 5</span>
        </sd-menu-item>
        <sd-menu-item key="6">
          <template #icon><icon-notification /></template>
          <span>nav 6</span>
        </sd-menu-item>
        <sd-menu-item key="7">
          <template #icon><icon-cloud /></template>
          <span>nav 7</span>
        </sd-menu-item>
        <sd-menu-item key="8">
          <template #icon><icon-settings /></template>
          <span>nav 8</span>
        </sd-menu-item>
      </sd-menu>
    </sd-layout-sider>
    <sd-layout>
      <sd-layout-header>Header</sd-layout-header>
      <sd-layout-content>Content</sd-layout-content>
      <sd-layout-footer>Footer</sd-layout-footer>
    </sd-layout>
  </sd-layout>
</template>

<style scoped>
  .layout-side-demo {
    height: 360px;
    min-height: 280px;
    overflow: hidden;
    border-radius: 8px;
  }

  .layout-side-demo :deep(.sd-layout-header) {
    height: 64px;
    color: #fff;
    line-height: 64px;
    text-align: center;
    background: #4096ff;
    padding-inline: 48px;
  }

  .layout-side-demo :deep(.sd-layout-content) {
    min-height: 120px;
    color: #fff;
    line-height: 120px;
    text-align: center;
    background: #0958d9;
  }

  .layout-side-demo :deep(.sd-layout-footer) {
    color: #fff;
    text-align: center;
    background: #4096ff;
  }

  .logo {
    height: 32px;
    margin: 16px;
    background: rgb(255 255 255 / 30%);
    border-radius: 6px;
  }
</style>
