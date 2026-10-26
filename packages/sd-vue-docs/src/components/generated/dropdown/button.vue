<template>
  <sd-space size="large">
    <sd-dropdown-button>
      发布
      <template #content>
        <sd-doption>立即保存</sd-doption>
        <sd-doption>保存并发布</sd-doption>
      </template>
    </sd-dropdown-button>
    <sd-dropdown-button disabled>
      禁用
      <template #content>
        <sd-doption>立即保存</sd-doption>
        <sd-doption>保存并发布</sd-doption>
      </template>
    </sd-dropdown-button>
    <sd-dropdown-button>
      发布
      <template #icon>
        <icon-down />
      </template>
      <template #content>
        <sd-doption>立即保存</sd-doption>
        <sd-doption>保存并发布</sd-doption>
      </template>
    </sd-dropdown-button>
  </sd-space>
</template>

<style>
  .sd-dropdown-open .sd-icon-down {
    transform: rotate(180deg);
  }
</style>
