<template>
  <sd-space direction="vertical">
    <sd-breadcrumb>
      <template #separator>
        <icon-right />
      </template>
      <sd-breadcrumb-item>首页</sd-breadcrumb-item>
      <sd-breadcrumb-item>渠道</sd-breadcrumb-item>
      <sd-breadcrumb-item>新闻</sd-breadcrumb-item>
    </sd-breadcrumb>
    <sd-breadcrumb separator="~">
      <sd-breadcrumb-item>首页</sd-breadcrumb-item>
      <sd-breadcrumb-item>渠道</sd-breadcrumb-item>
      <sd-breadcrumb-item>新闻</sd-breadcrumb-item>
    </sd-breadcrumb>
    <sd-breadcrumb>
      <template #separator>
        <icon-right />
      </template>
      <sd-breadcrumb-item separator="->">首页</sd-breadcrumb-item>
      <sd-breadcrumb-item>渠道</sd-breadcrumb-item>
      <sd-breadcrumb-item>新闻</sd-breadcrumb-item>
    </sd-breadcrumb>
  </sd-space>
</template>
