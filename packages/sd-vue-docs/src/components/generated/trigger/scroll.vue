<template>
  <div :style="{ height: '100px', overflowY: 'scroll' }">
    <div :style="{ height: '200px' }">
      <sd-trigger trigger="click" update-at-scroll>
        <sd-button :style="{ marginTop: '80px' }">Click Me</sd-button>
        <template #content>
          <div class="demo-basic">
            <sd-empty />
          </div>
        </template>
      </sd-trigger>
    </div>
  </div>
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
