<template>
  <sd-space direction="vertical">
    <sd-breadcrumb :max-count="3">
      <sd-breadcrumb-item>首页</sd-breadcrumb-item>
      <sd-breadcrumb-item>子首页</sd-breadcrumb-item>
      <sd-breadcrumb-item>所有渠道</sd-breadcrumb-item>
      <sd-breadcrumb-item>渠道</sd-breadcrumb-item>
      <sd-breadcrumb-item>新闻</sd-breadcrumb-item>
      <sd-breadcrumb-item>岗位</sd-breadcrumb-item>
    </sd-breadcrumb>
    <sd-breadcrumb :max-count="3">
      <template #more-icon>
        <sd-tooltip content="更多路由 a/b/c">
          <icon-more />
        </sd-tooltip>
      </template>
      <sd-breadcrumb-item>首页</sd-breadcrumb-item>
      <sd-breadcrumb-item>子首页</sd-breadcrumb-item>
      <sd-breadcrumb-item>所有渠道</sd-breadcrumb-item>
      <sd-breadcrumb-item>渠道</sd-breadcrumb-item>
      <sd-breadcrumb-item>新闻</sd-breadcrumb-item>
      <sd-breadcrumb-item>岗位</sd-breadcrumb-item>
    </sd-breadcrumb>
  </sd-space>
</template>
