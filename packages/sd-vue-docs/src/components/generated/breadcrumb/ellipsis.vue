<template>
  <sd-space direction="vertical">
    <sd-breadcrumb :max-count="3">
      <sd-breadcrumb-item>Home</sd-breadcrumb-item>
      <sd-breadcrumb-item>Sub Home</sd-breadcrumb-item>
      <sd-breadcrumb-item>All Channel</sd-breadcrumb-item>
      <sd-breadcrumb-item>Channel</sd-breadcrumb-item>
      <sd-breadcrumb-item>News</sd-breadcrumb-item>
      <sd-breadcrumb-item>Post</sd-breadcrumb-item>
    </sd-breadcrumb>
    <sd-breadcrumb :max-count="3">
      <template #more-icon>
        <sd-tooltip content="more routes a/b/c">
          <icon-more />
        </sd-tooltip>
      </template>
      <sd-breadcrumb-item>Home</sd-breadcrumb-item>
      <sd-breadcrumb-item>Sub Home</sd-breadcrumb-item>
      <sd-breadcrumb-item>All Channel</sd-breadcrumb-item>
      <sd-breadcrumb-item>Channel</sd-breadcrumb-item>
      <sd-breadcrumb-item>News</sd-breadcrumb-item>
      <sd-breadcrumb-item>Post</sd-breadcrumb-item>
    </sd-breadcrumb>
  </sd-space>
</template>
