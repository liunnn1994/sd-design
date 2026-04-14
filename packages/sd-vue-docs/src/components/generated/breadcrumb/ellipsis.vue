<template>
  <a-space direction="vertical">
    <a-breadcrumb :max-count="3">
      <a-breadcrumb-item>Home</a-breadcrumb-item>
      <a-breadcrumb-item>Sub Home</a-breadcrumb-item>
      <a-breadcrumb-item>All Channel</a-breadcrumb-item>
      <a-breadcrumb-item>Channel</a-breadcrumb-item>
      <a-breadcrumb-item>News</a-breadcrumb-item>
      <a-breadcrumb-item>Post</a-breadcrumb-item>
    </a-breadcrumb>
    <a-breadcrumb :max-count="3">
      <template #more-icon>
        <a-tooltip content="more routes a/b/c">
          <icon-more />
        </a-tooltip>
      </template>
      <a-breadcrumb-item>Home</a-breadcrumb-item>
      <a-breadcrumb-item>Sub Home</a-breadcrumb-item>
      <a-breadcrumb-item>All Channel</a-breadcrumb-item>
      <a-breadcrumb-item>Channel</a-breadcrumb-item>
      <a-breadcrumb-item>News</a-breadcrumb-item>
      <a-breadcrumb-item>Post</a-breadcrumb-item>
    </a-breadcrumb>
  </a-space>
</template>
