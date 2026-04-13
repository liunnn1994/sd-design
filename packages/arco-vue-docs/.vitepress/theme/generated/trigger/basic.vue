<template>
  <a-space>
    <a-trigger position="top" auto-fit-position :unmount-on-close="false">
      <span>Hover Me</span>
      <template #content>
        <div class="demo-basic">
          <a-empty />
        </div>
      </template>
    </a-trigger>
    <a-trigger trigger="click" :unmount-on-close="false">
      <a-button>Click Me</a-button>
      <template #content>
        <div class="demo-basic">
          <a-empty />
        </div>
      </template>
    </a-trigger>
    <a-trigger trigger="focus">
      <a-input placeholder="Focus on me" />
      <template #content>
        <div class="demo-basic">
          <a-empty />
        </div>
      </template>
    </a-trigger>
  </a-space>
</template>

<style scoped>
.demo-basic {
  padding: 10px;
  width: 200px;
  background-color: var(--color-bg-popup);
  border-radius: 4px;
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.15);
}
</style>
