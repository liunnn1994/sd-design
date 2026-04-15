<template>
  <sd-space>
    <sd-trigger>
      <sd-button>BOTTOM</sd-button>
      <template #content>
        <div class="trigger-demo-translate">
          <sd-empty />
        </div>
      </template>
    </sd-trigger>
    <sd-trigger :popup-translate="[100, 20]">
      <sd-button>BOTTOM OFFSET[100, 20]</sd-button>
      <template #content>
        <div class="trigger-demo-translate">
          <sd-empty />
        </div>
      </template>
    </sd-trigger>
    <sd-trigger :popup-translate="[-100, 20]">
      <sd-button>BOTTOM OFFSET[-100, 20]</sd-button>
      <template #content>
        <div class="trigger-demo-translate">
          <sd-empty />
        </div>
      </template>
    </sd-trigger>
  </sd-space>
</template>

<style scoped>
  .trigger-demo-translate {
    width: 200px;
    padding: 10px;
    background-color: var(--color-bg-popup);
    border-radius: 4px;
    box-shadow: 0 2px 8px 0 rgb(0 0 0 / 15%);
  }
</style>
