<template>
  <sd-trigger trigger="click" align-point>
    <div class="demo-point-trigger">
      <div>Click Me</div>
    </div>
    <template #content>
      <div class="demo-point">
        <sd-empty />
      </div>
    </template>
  </sd-trigger>
</template>

<style scoped>
  .demo-point-trigger {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 300px;
    background-color: var(--color-fill-2);
  }

  .demo-point {
    width: 200px;
    padding: 10px;
    background-color: var(--color-bg-popup);
    border-radius: 4px;
    box-shadow: 0 2px 8px 0 rgb(0 0 0 / 15%);
  }

  .demo-point-wrapper {
    display: block;
  }
</style>
