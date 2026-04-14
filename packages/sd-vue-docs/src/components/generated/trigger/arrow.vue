<template>
  <a-space>
    <a-trigger trigger="click">
      <a-button>Click Me</a-button>
      <template #content>
        <div class="demo-arrow">
          <a-empty />
        </div>
      </template>
    </a-trigger>
    <a-trigger trigger="click" show-arrow>
      <a-button>Click Me (Arrow)</a-button>
      <template #content>
        <div class="demo-arrow">
          <a-empty />
        </div>
      </template>
    </a-trigger>
  </a-space>
</template>

<style scoped>
  .demo-arrow {
    box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.15);
    padding: 10px;
    width: 200px;
    background-color: var(--color-bg-popup);
    border-radius: 4px;
  }
</style>
