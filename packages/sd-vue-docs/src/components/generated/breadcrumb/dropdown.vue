<template>
  <sd-space direction="vertical">
    <sd-breadcrumb :routes="routes" />
    <sd-breadcrumb>
      <sd-breadcrumb-item>首页</sd-breadcrumb-item>
      <sd-breadcrumb-item :droplist="droplist"> 渠道 </sd-breadcrumb-item>
      <sd-breadcrumb-item>新闻</sd-breadcrumb-item>
    </sd-breadcrumb>
    <sd-breadcrumb>
      <sd-breadcrumb-item>首页</sd-breadcrumb-item>
      <sd-breadcrumb-item>
        <template #droplist>
          <sd-doption>选项 1</sd-doption>
          <sd-dsubmenu value="option-1">
            <template #default>选项 2</template>
            <template #content>
              <sd-doption>选项 2-1</sd-doption>
              <sd-doption>选项 2-2</sd-doption>
              <sd-doption>选项 2-3</sd-doption>
            </template>
            <template #footer>
              <div class="sd:p-1.5 sd:text-center">
                <sd-button>点击</sd-button>
              </div>
            </template>
          </sd-dsubmenu>
          <sd-doption>选项 3</sd-doption>
        </template>
        渠道
      </sd-breadcrumb-item>
      <sd-breadcrumb-item>新闻</sd-breadcrumb-item>
    </sd-breadcrumb>
  </sd-space>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const routes = ref([
    {
      path: '/',
      label: '首页',
    },
    {
      path: '/channel',
      label: '渠道',
      children: [
        {
          path: '/users',
          label: '用户',
        },
        {
          path: '/permission',
          label: '权限',
        },
      ],
    },
    {
      path: '/news',
      label: '新闻',
    },
  ]);

  const droplist = ref([
    {
      path: '/goods',
      label: '商品',
    },
    {
      path: '/wallet',
      label: '钱包',
    },
  ]);
</script>
