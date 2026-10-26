<template>
  <sd-space>
    <sd-trigger position="top" auto-fit-position :unmount-on-close="false">
      <span>悬停此处</span>
      <template #content>
        <div class="demo-basic">
          <sd-empty />
        </div>
      </template>
    </sd-trigger>
    <sd-trigger trigger="click" :unmount-on-close="false">
      <sd-button>点击我</sd-button>
      <template #content>
        <div class="demo-basic">
          <sd-empty />
        </div>
      </template>
    </sd-trigger>
    <sd-trigger trigger="focus">
      <sd-input placeholder="聚焦此处" />
      <template #content>
        <div class="demo-basic">
          <sd-empty />
        </div>
      </template>
    </sd-trigger>
  </sd-space>
</template>

<style scoped>
  .demo-basic {
    width: 200px;
    padding: 10px;
    background-color: var(--sd-color-bg-popup);
    border-radius: 4px;
    box-shadow: 0 2px 8px 0 rgb(0 0 0 / 15%);
  }
</style>
