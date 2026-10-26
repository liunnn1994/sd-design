<template>
  <div class="menu-demo">
    <sd-button
      class="sd:mb-1! sd:h-7.5 sd:px-3 sd:leading-7.5"
      type="primary"
      @click="toggleCollapse"
    >
      <icon-menu-unfold v-if="collapsed" />
      <icon-menu-fold v-else />
    </sd-button>
    <sd-menu
      :style="{ width: '200px', borderRadius: '4px' }"
      theme="dark"
      :collapsed="collapsed"
      :default-open-keys="['0']"
      :default-selected-keys="['0_2']"
    >
      <sd-sub-menu key="0">
        <template #icon><icon-apps></icon-apps></template>
        <template #title>导航 1</template>
        <sd-menu-item key="0_0">菜单 1</sd-menu-item>
        <sd-menu-item key="0_1">菜单 2</sd-menu-item>
        <sd-menu-item key="0_2">菜单 3</sd-menu-item>
        <sd-menu-item key="0_3">菜单 4</sd-menu-item>
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
        <sd-menu-item key="2_0">菜单 1</sd-menu-item>
        <sd-menu-item key="2_1">菜单 2</sd-menu-item>
        <sd-sub-menu key="2_2" title="导航 4">
          <sd-menu-item key="2_2_0">菜单 1</sd-menu-item>
          <sd-menu-item key="2_2_1">菜单 2</sd-menu-item>
        </sd-sub-menu>
      </sd-sub-menu>
    </sd-menu>
  </div>
</template>
<script setup lang="ts">
  import { ref } from 'vue';

  import {
    IconMenuFold,
    IconMenuUnfold,
    IconApps,
    IconBug,
    IconBulb,
  } from '@sdata/web-vue/es/icon/index.js';

  const collapsed = ref(false);

  function toggleCollapse() {
    collapsed.value = !collapsed.value;
  }
</script>
<style scoped>
  .menu-demo {
    box-sizing: border-box;
    width: 100%;
    padding: 40px;
    background-color: var(--color-neutral-2);
  }
</style>
