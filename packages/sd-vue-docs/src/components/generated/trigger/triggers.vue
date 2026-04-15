<template>
  <sd-trigger :trigger="['click', 'hover', 'focus']">
    <sd-input placeholder="Click/Hover/Focus on me" />
    <template #content>
      <div class="demo-trigger">
        <sd-empty />
      </div>
    </template>
  </sd-trigger>
</template>

<style scoped>
  .demo-trigger {
    width: 200px;
    padding: 10px;
    background-color: var(--color-bg-popup);
    border-radius: 4px;
    box-shadow: 0 2px 8px 0 rgb(0 0 0 / 15%);
  }
</style>
