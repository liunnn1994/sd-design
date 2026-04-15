<template>
  <sd-space direction="vertical">
    <sd-breadcrumb>
      <template #separator>
        <icon-right />
      </template>
      <sd-breadcrumb-item>Home</sd-breadcrumb-item>
      <sd-breadcrumb-item>Channel</sd-breadcrumb-item>
      <sd-breadcrumb-item>News</sd-breadcrumb-item>
    </sd-breadcrumb>
    <sd-breadcrumb separator="~">
      <sd-breadcrumb-item>Home</sd-breadcrumb-item>
      <sd-breadcrumb-item>Channel</sd-breadcrumb-item>
      <sd-breadcrumb-item>News</sd-breadcrumb-item>
    </sd-breadcrumb>
    <sd-breadcrumb>
      <template #separator>
        <icon-right />
      </template>
      <sd-breadcrumb-item separator="->">Home</sd-breadcrumb-item>
      <sd-breadcrumb-item>Channel</sd-breadcrumb-item>
      <sd-breadcrumb-item>News</sd-breadcrumb-item>
    </sd-breadcrumb>
  </sd-space>
</template>
