<template>
  <div class="menu-demo">
    <sd-menu
      :style="{ width: '200px', height: '100%' }"
      :default-open-keys="['0']"
      :default-selected-keys="['0_1']"
      show-collapse-button
    >
      <sd-menu-item key="0_0_0" data-obj="1">菜单 1</sd-menu-item>
      <sd-sub-menu key="0">
        <template #icon><icon-apps></icon-apps></template>
        <template #title>导航 1</template>
        <sd-menu-item key="0_0">菜单 1</sd-menu-item>
        <sd-menu-item key="0_1">菜单 2</sd-menu-item>
        <sd-menu-item key="0_2" disabled>菜单 3</sd-menu-item>
      </sd-sub-menu>
      <sd-sub-menu key="1">
        <template #icon><icon-bug></icon-bug></template>
        <template #title>导航 2</template>
        <sd-menu-item key="1_0">菜单 1</sd-menu-item>
        <sd-menu-item key="1_1">菜单 2</sd-menu-item>
        <sd-menu-item key="1_2">菜单 3</sd-menu-item>
      </sd-sub-menu>
      <sd-sub-menu key="2">
        <template #icon><icon-bulb></icon-bulb></template>
        <template #title>导航 3</template>
        <sd-menu-item-group title="菜单组 1">
          <sd-menu-item key="2_0">菜单 1</sd-menu-item>
          <sd-menu-item key="2_1">菜单 2</sd-menu-item>
        </sd-menu-item-group>
        <sd-menu-item-group title="菜单组 2">
          <sd-menu-item key="2_2">菜单 3</sd-menu-item>
          <sd-menu-item key="2_3">菜单 4</sd-menu-item>
        </sd-menu-item-group>
      </sd-sub-menu>
    </sd-menu>
  </div>
</template>
<script setup lang="ts">
  import {
    IconMenuFold,
    IconMenuUnfold,
    IconApps,
    IconBug,
    IconBulb,
  } from '@sdata/web-vue/es/icon/index.js';
</script>
<style scoped>
  .menu-demo {
    box-sizing: border-box;
    width: 100%;
    height: 600px;
    padding: 40px;
    background-color: var(--color-neutral-2);
  }
</style>
