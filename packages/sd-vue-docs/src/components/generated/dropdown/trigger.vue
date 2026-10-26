<template>
  <sd-space size="large">
    <sd-dropdown>
      <sd-button>点击我</sd-button>
      <template #content>
        <sd-doption>选项 1</sd-doption>
        <sd-doption>选项 2</sd-doption>
        <sd-doption>选项 3</sd-doption>
      </template>
    </sd-dropdown>
    <sd-dropdown trigger="hover">
      <sd-button>悬停此处</sd-button>
      <template #content>
        <sd-doption>选项 1</sd-doption>
        <sd-doption>选项 2</sd-doption>
        <sd-doption>选项 3</sd-doption>
      </template>
    </sd-dropdown>
  </sd-space>
</template>
