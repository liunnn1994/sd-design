<template>
  <sd-layout class="layout-fixed-demo">
    <sd-layout-header class="header">Header</sd-layout-header>
    <sd-layout class="body">
      <sd-layout-sider class="sider" collapsible>
        <div class="logo" />
        <sd-menu :default-selected-keys="['1']">
          <sd-menu-item key="1">
            <template #icon><icon-user /></template>
            <span>nav 1</span>
          </sd-menu-item>
          <sd-menu-item key="2">
            <template #icon><icon-video-camera /></template>
            <span>nav 2</span>
          </sd-menu-item>
          <sd-menu-item key="3">
            <template #icon><icon-upload /></template>
            <span>nav 3</span>
          </sd-menu-item>
        </sd-menu>
      </sd-layout-sider>
      <sd-layout-content class="content">Content</sd-layout-content>
    </sd-layout>
    <sd-layout-footer class="footer">Footer</sd-layout-footer>
  </sd-layout>
</template>

<style scoped>
  .layout-fixed-demo {
    min-height: 360px;
    overflow: hidden;
    border-radius: 8px;
  }

  .header {
    position: sticky;
    top: 0;
    z-index: 1;
    height: 64px;
    line-height: 64px;
    text-align: center;
    background: var(--sd-color-fill-3);
    padding-inline: 48px;
  }

  .sider {
    text-align: center;
    background: var(--sd-color-fill-1);
  }

  .content {
    min-height: 120px;
    line-height: 120px;
    text-align: center;
    background: var(--sd-color-fill-4);
  }

  .footer {
    text-align: center;
    background: var(--sd-color-fill-3);
  }

  .logo {
    height: 32px;
    margin: 16px;
    background: rgb(0 0 0 / 30%);
    border-radius: 6px;
  }
</style>
