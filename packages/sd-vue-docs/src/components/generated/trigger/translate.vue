<template>
  <a-space>
    <a-trigger>
      <a-button>BOTTOM</a-button>
      <template #content>
        <div class="trigger-demo-translate">
          <a-empty />
        </div>
      </template>
    </a-trigger>
    <a-trigger :popup-translate="[100, 20]">
      <a-button>BOTTOM OFFSET[100, 20]</a-button>
      <template #content>
        <div class="trigger-demo-translate">
          <a-empty />
        </div>
      </template>
    </a-trigger>
    <a-trigger :popup-translate="[-100, 20]">
      <a-button>BOTTOM OFFSET[-100, 20]</a-button>
      <template #content>
        <div class="trigger-demo-translate">
          <a-empty />
        </div>
      </template>
    </a-trigger>
  </a-space>
</template>

<style scoped>
  .trigger-demo-translate {
    padding: 10px;
    width: 200px;
    background-color: var(--color-bg-popup);
    border-radius: 4px;
    box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.15);
  }
</style>
