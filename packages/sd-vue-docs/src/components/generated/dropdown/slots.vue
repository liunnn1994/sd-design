<template>
  <sd-dropdown>
    <sd-button>打开菜单</sd-button>
    <template #header>
      <div class="sd:px-6 sd:py-2">常用操作</div>
    </template>
    <template #content>
      <sd-doption>复制</sd-doption>
      <sd-doption>移动</sd-doption>
    </template>
    <template #footer>
      <div class="sd:px-6 sd:py-2">共 2 项</div>
    </template>
  </sd-dropdown>
</template>
