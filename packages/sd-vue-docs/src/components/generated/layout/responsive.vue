<template>
  <sd-layout class="layout-responsive-demo">
    <sd-layout-sider
      breakpoint="lg"
      collapsed-width="0"
      theme="dark"
      @breakpoint="onBreakpoint"
      @collapse="onCollapse"
    >
      <div class="logo" />
      <sd-menu theme="dark" :default-selected-keys="['1']">
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
        <sd-menu-item key="4">
          <template #icon><icon-upload /></template>
          <span>nav 4</span>
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

<script setup lang="ts">
  const onBreakpoint = (broken: boolean) => {
    // eslint-disable-next-line no-console
    console.log('broken:', broken);
  };

  const onCollapse = (collapsed: boolean, type: 'clickTrigger' | 'responsive') => {
    // eslint-disable-next-line no-console
    console.log('collapsed:', collapsed, type);
  };
</script>

<style scoped>
  .layout-responsive-demo {
    min-height: 280px;
    border-radius: 8px;
    overflow: hidden;
  }

  .layout-responsive-demo :deep(.sd-layout-header) {
    height: 64px;
    padding-inline: 48px;
    line-height: 64px;
    color: #fff;
    text-align: center;
    background: #4096ff;
  }

  .layout-responsive-demo :deep(.sd-layout-content) {
    min-height: 120px;
    line-height: 120px;
    color: #fff;
    text-align: center;
    background: #0958d9;
  }

  .layout-responsive-demo :deep(.sd-layout-footer) {
    color: #fff;
    text-align: center;
    background: #4096ff;
  }

  .logo {
    height: 32px;
    margin: 16px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 6px;
  }
</style>
