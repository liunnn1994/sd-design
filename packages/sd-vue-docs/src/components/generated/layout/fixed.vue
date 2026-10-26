<template>
  <sd-layout class="layout-fixed-demo">
    <sd-layout-header class="header">页头</sd-layout-header>
    <sd-layout class="body">
      <sd-layout-sider class="sider" collapsible>
        <div class="logo" />
        <sd-menu :default-selected-keys="['1']">
          <sd-menu-item key="1">
            <template #icon><icon-user /></template>
            <span>导航 1</span>
          </sd-menu-item>
          <sd-menu-item key="2">
            <template #icon><icon-video-camera /></template>
            <span>导航 2</span>
          </sd-menu-item>
          <sd-menu-item key="3">
            <template #icon><icon-upload /></template>
            <span>导航 3</span>
          </sd-menu-item>
        </sd-menu>
      </sd-layout-sider>
      <sd-layout-content class="content">内容</sd-layout-content>
    </sd-layout>
    <sd-layout-footer class="footer">页脚</sd-layout-footer>
  </sd-layout>
</template>

<style scoped>
  .layout-fixed-demo {
    height: 360px;
    overflow: auto;
    border-radius: 8px;
  }

  .layout-fixed-demo .header {
    position: sticky;
    top: 0;
    z-index: 1;
    height: 64px;
    line-height: 64px;
    color: var(--sd-color-text-1);
    text-align: center;
    background: var(--sd-color-fill-3);
    padding-inline: 48px;
  }

  .layout-fixed-demo .body {
    flex: none;
    min-height: 480px;
  }

  .layout-fixed-demo .sider {
    text-align: center;
    background: var(--sd-color-fill-1);
  }

  .layout-fixed-demo .content {
    min-height: 120px;
    line-height: 120px;
    text-align: center;
    background: var(--sd-color-fill-4);
  }

  .layout-fixed-demo .footer {
    text-align: center;
    background: var(--sd-color-fill-3);
  }

  .layout-fixed-demo .logo {
    height: 32px;
    margin: 16px;
    background: rgb(0 0 0 / 30%);
    border-radius: 6px;
  }
</style>
