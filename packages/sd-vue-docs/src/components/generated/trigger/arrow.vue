<template>
  <sd-space>
    <sd-trigger trigger="click">
      <sd-button>点击我</sd-button>
      <template #content>
        <div class="demo-arrow">
          <sd-empty />
        </div>
      </template>
    </sd-trigger>
    <sd-trigger trigger="click" show-arrow>
      <sd-button>点击我（带箭头）</sd-button>
      <template #content>
        <div class="demo-arrow">
          <sd-empty />
        </div>
      </template>
    </sd-trigger>
  </sd-space>
</template>

<style scoped>
  .demo-arrow {
    width: 200px;
    padding: 10px;
    background-color: var(--sd-color-bg-popup);
    border-radius: 4px;
    box-shadow: 0 2px 8px 0 rgb(0 0 0 / 15%);
  }
</style>
