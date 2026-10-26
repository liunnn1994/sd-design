<template>
  <sd-dropdown trigger="contextMenu" alignPoint class="sd:block">
    <div class="sd:flex sd:h-[300px] sd:items-center sd:justify-center sd:bg-[var(--color-fill-2)]">
      <div>点击我</div>
    </div>
    <template #content>
      <sd-doption>选项 1</sd-doption>
      <sd-doption>选项 2</sd-doption>
      <sd-doption>选项 3</sd-doption>
    </template>
  </sd-dropdown>
</template>
