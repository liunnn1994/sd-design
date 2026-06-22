<template>
  <sd-layout class="layout-custom-trigger-demo">
    <sd-layout-sider hide-trigger collapsible theme="dark" :collapsed="collapsed">
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
    <sd-layout>
      <sd-layout-header class="header">
        <sd-button type="text" class="trigger" @click="toggleCollapsed">
          <template #icon>
            <icon-menu-unfold v-if="collapsed" />
            <icon-menu-fold v-else />
          </template>
        </sd-button>
      </sd-layout-header>
      <sd-layout-content class="content">Content</sd-layout-content>
    </sd-layout>
  </sd-layout>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const collapsed = ref(false);

  const toggleCollapsed = () => {
    collapsed.value = !collapsed.value;
  };
</script>

<style scoped>
  .layout-custom-trigger-demo {
    min-height: 280px;
    overflow: hidden;
    border-radius: 8px;
  }

  .header {
    height: 64px;
    padding: 0;
    background: #fff;
  }

  .trigger {
    width: 64px;
    height: 64px;
    font-size: 16px;
  }

  .content {
    min-height: 280px;
    margin: 24px 16px;
    padding: 24px;
    color: #fff;
    background: #0958d9;
    border-radius: 8px;
  }

  .logo {
    height: 32px;
    margin: 16px;
    background: rgb(255 255 255 / 30%);
    border-radius: 6px;
  }
</style>
