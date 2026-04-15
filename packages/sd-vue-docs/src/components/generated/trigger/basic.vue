<template>
  <sd-space>
    <sd-trigger position="top" auto-fit-position :unmount-on-close="false">
      <span>Hover Me</span>
      <template #content>
        <div class="demo-basic">
          <sd-empty />
        </div>
      </template>
    </sd-trigger>
    <sd-trigger trigger="click" :unmount-on-close="false">
      <sd-button>Click Me</sd-button>
      <template #content>
        <div class="demo-basic">
          <sd-empty />
        </div>
      </template>
    </sd-trigger>
    <sd-trigger trigger="focus">
      <sd-input placeholder="Focus on me" />
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
    background-color: var(--color-bg-popup);
    border-radius: 4px;
    box-shadow: 0 2px 8px 0 rgb(0 0 0 / 15%);
  }
</style>
